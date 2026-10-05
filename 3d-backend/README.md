# Meu Próprio Meshy (Motor 3D Local)

Para ter o seu próprio sistema de conversão de Imagens para 3D sem depender de APIs pagas (como Tripo3D ou Meshy), você pode rodar este servidor localmente.

Nós usamos o **TripoSR** (o motor Open-Source construído pela Stability AI e Tripo3D).

## Requisitos de Hardware
- Uma Placa de Vídeo (GPU) **NVIDIA** com pelo menos 6GB a 8GB de VRAM.
- Se você não tem uma placa de vídeo dedicada forte, isso vai rodar pelo processador (CPU) e vai demorar **muito tempo** por miniatura.

## Como instalar (Windows)

1. Você precisa ter o [Python](https://www.python.org/downloads/) instalado (marque a caixa "Add Python to PATH" na instalação).
2. Você precisa ter o [Git](https://git-scm.com/downloads) instalado.
3. Abra o seu Terminal/PowerShell como Administrador e rode os comandos abaixo, um por vez:

\`\`\`powershell
# 1. Instalar o PyTorch configurado para usar a sua Placa de Vídeo (CUDA)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 2. Instalar o servidor web e ferramentas de imagem
pip install fastapi uvicorn rembg Pillow trimesh

# 3. Baixar o código de IA de conversão 3D
git clone https://github.com/VAST-AI-Research/TripoSR.git

# 4. Instalar o modelo da IA
cd TripoSR
pip install -e .
cd ..
\`\`\`

## Como ligar o seu servidor 3D

Toda vez que você quiser usar a página "A Forja 3D" no seu projeto, você precisa antes ligar esse cérebro de IA:

1. Abra o terminal nesta pasta (\`3d-backend\`).
2. Rode o comando:
\`\`\`powershell
python server.py
\`\`\`
3. Ele vai começar a baixar os "Pesos" da IA na primeira vez (são alguns Gigabytes). Depois ele vai avisar que está rodando na porta \`8000\`.

## Como ligar com o React

Quando este servidor estiver rodando, você vai lá no seu arquivo \`frontend/src/pages/Modelador.tsx\` e troca aquele código de \`simulateGeneration()\` por isso:

\`\`\`javascript
const simulateGeneration = async (file) => {
    setProgress(30);
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('http://localhost:8000/generate-3d', {
            method: 'POST',
            body: formData
        });
        
        setProgress(80);
        
        // Recebendo o arquivo 3D
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        setProgress(100);
        setStep('done');
        setModelUrl(url); // O model-viewer vai exibir o que a IA gerou!
        
    } catch (e) {
        alert("Erro ao conectar com a IA local: " + e.message);
        setStep('idle');
    }
};
\`\`\`
