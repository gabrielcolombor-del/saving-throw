import os
import io
import time
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch

# NOTA: Para rodar isso, você precisa instalar o TripoSR e remover o fundo da imagem
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
# pip install fastapi uvicorn rembg Pillow
# git clone https://github.com/VAST-AI-Research/TripoSR.git
# cd TripoSR && pip install -e .

try:
    from tsr.system import TSR
    from tsr.utils import remove_background, resize_foreground
    HAS_TRIPOSR = True
except ImportError:
    HAS_TRIPOSR = False

app = FastAPI(title="Meu Próprio Meshy (TripoSR)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir o React acessar
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar o modelo 3D na placa de vídeo
if HAS_TRIPOSR:
    print("Carregando IA 3D... Isso vai exigir GPU!")
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    # Carrega o modelo open-source TripoSR (cerca de 2-3GB de VRAM necessários)
    model = TSR.from_pretrained(
        "stabilityai/TripoSR",
        config_name="config.yaml",
        weight_name="model.ckpt",
    )
    model.renderer.set_chunk_size(131072)
    model.to(device)
else:
    print("TripoSR não instalado. O servidor vai rodar em modo simulação (Mock).")


@app.post("/generate-3d")
async def generate_3d(image: UploadFile = File(...)):
    """
    Recebe uma imagem 2D do React, remove o fundo,
    passa pela IA TripoSR e devolve um arquivo .obj ou .glb
    """
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Ler a imagem enviada pelo front-end
    image_bytes = await image.read()
    input_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    filename = f"model_{int(time.time())}"
    out_glb_path = os.path.join(output_dir, f"{filename}.glb")

    if not HAS_TRIPOSR:
        # Se não instalou as dependências de IA pesada, retorna erro ou mockup
        return {"error": "TripoSR não instalado no servidor.", "instrucoes": "Leia o README para instalar."}
    
    try:
        # 2. Pré-processamento: Remover o fundo e centralizar (Essencial para IAs 3D)
        print("Removendo fundo da imagem...")
        image_nobg = remove_background(input_image, rembg_session=None)
        image_processed = resize_foreground(image_nobg, 0.85)
        
        # 3. Geração da Malha 3D (Aqui a mágica do 'Meshy' acontece)
        print("Iniciando geração 3D na GPU...")
        with torch.no_grad():
            # A IA gera os 'volumes' matemáticos baseados na imagem
            scene_codes = model(image_processed, device=device)
            # Converte os volumes em uma malha 3D (Mesh)
            meshes = model.extract_mesh(scene_codes)
            
        # 4. Salvar e Exportar
        mesh = meshes[0]
        
        # O TripoSR exporta para .obj nativamente, para exportar pra GLB usa-se trimesh
        mesh_obj_path = os.path.join(output_dir, f"{filename}.obj")
        with open(mesh_obj_path, "w") as f:
            mesh.export(f)
            
        # Idealmente você converte o .obj para .glb aqui com a biblioteca trimesh
        # import trimesh
        # trimesh.load(mesh_obj_path).export(out_glb_path)
            
        return FileResponse(mesh_obj_path, media_type="application/octet-stream", filename="resultado.obj")

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Inicia o servidor local na porta 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
