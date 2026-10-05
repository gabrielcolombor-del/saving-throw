@echo off
echo Iniciando a instalacao das IAs (Isso vai demorar, pois o PyTorch e gigante - cerca de 2.5GB)...
call venv\Scripts\activate.bat

echo 1. Instalando PyTorch com suporte a CUDA para sua GTX 1070...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

echo 2. Instalando ferramentas de servidor e remocao de fundo...
pip install fastapi uvicorn rembg Pillow trimesh python-multipart

echo 3. Baixando e instalando o TripoSR...
if not exist "TripoSR" (
    git clone https://github.com/VAST-AI-Research/TripoSR.git
)
cd TripoSR
pip install -e .
cd ..

echo Instalacao concluida! Para ligar o servidor, rode start_server.bat
pause
