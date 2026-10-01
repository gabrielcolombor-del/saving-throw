import { useState, useRef } from 'react';

const ModelViewer = 'model-viewer' as any;

type Step = 'idle' | 'uploading' | 'generating' | 'done';

export function Modelador() {
  const [step, setStep] = useState<Step>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startProcess(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const startProcess = (file: File) => {
    // 1. Show image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 2. Mock upload progress before sending
    setStep('uploading');
    setProgress(0);
    
    let currentProgress = 0;
    const uploadInterval = setInterval(() => {
      currentProgress += 15;
      setProgress(currentProgress);
      if (currentProgress >= 90) {
        clearInterval(uploadInterval);
        setStep('generating');
        runRealGeneration(file);
      }
    }, 100);
  };

  const runRealGeneration = async (file: File) => {
    setProgress(10); // Start of generation
    const formData = new FormData();
    formData.append('image', file);

    // Simular progresso falso enquanto a API trabalha
    let genProgress = 10;
    const genInterval = setInterval(() => {
        if(genProgress < 90) {
            genProgress += 2;
            setProgress(genProgress);
        }
    }, 1000);

    try {
        const backendUrl = import.meta.env.VITE_3D_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/generate-3d`, {
            method: 'POST',
            body: formData
        });

        clearInterval(genInterval);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Erro no servidor local");
        }
        
        setProgress(100);
        
        // Recebendo o arquivo 3D (.obj)
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        setStep('done');
        setModelUrl(url); // Mostra o resultado oficial da IA!
        
    } catch (e: any) {
        clearInterval(genInterval);
        alert("Erro ao conectar com a sua IA local: " + e.message + "\n\nO servidor (start_server.bat) está rodando?");
        reset();
    }
  };

  const reset = () => {
    setStep('idle');
    setImagePreview(null);
    setModelUrl(null);
    setProgress(0);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black pb-20">
      
      {/* HEADER SECTION */}
      <section className="relative pt-20 pb-12 overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-[url('/assets/imagens/texture-dark.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <i className="fa-solid fa-cube text-3xl"></i>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-title text-amber-500 mb-4 tracking-wide drop-shadow-lg">
            A Forja 3D
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Nossa Inteligência Artificial arcana converte qualquer ilustração, retrato ou design de monstro em um modelo 3D altamente detalhado pronto para impressão na sua mesa.
          </p>
        </div>
      </section>

      {/* WORKSPACE SECTION */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: UPLOAD / PROGRESS */}
            <div className="flex flex-col h-full space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-3 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-black flex items-center justify-center text-xs">1</span>
                Sua Referência
              </h2>

              {step === 'idle' && (
                <div 
                  className="flex-1 min-h-[300px] border-2 border-dashed border-zinc-700 hover:border-amber-500 rounded-xl bg-zinc-950/50 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all hover:bg-zinc-900 group"
                  onClick={triggerFileInput}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors mb-4">
                    <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-300 mb-2 group-hover:text-amber-400 transition-colors">Arraste e Solte sua Imagem</h3>
                  <p className="text-xs text-zinc-500 mb-6 max-w-[250px]">
                    Formatos suportados: JPG, PNG, WEBP (Máx. 10MB)
                  </p>
                  <button className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition-colors">
                    Ou selecione um arquivo
                  </button>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*"
                  />
                </div>
              )}

              {(step === 'uploading' || step === 'generating' || step === 'done') && (
                <div className="flex-1 border border-zinc-800 rounded-xl bg-zinc-950/50 p-4 flex flex-col relative overflow-hidden group">
                  <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm scale-110 transition-transform duration-1000" style={{ backgroundImage: `url(${imagePreview})` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
                  
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
                    <img src={imagePreview!} alt="Referência" className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-xl shadow-2xl border-2 border-zinc-800 mb-6" />
                    
                    {step === 'uploading' && (
                      <div className="w-full max-w-xs text-center">
                        <div className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                          <i className="fa-solid fa-spinner fa-spin"></i> Analisando Runas...
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    )}

                    {step === 'generating' && (
                      <div className="w-full max-w-xs text-center">
                        <div className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                          <i className="fa-solid fa-wand-magic-sparkles animate-pulse"></i> Esculpindo Malha 3D...
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                          <div className="absolute top-0 bottom-0 left-0 bg-amber-400 transition-all duration-100" style={{ width: `${progress}%` }}></div>
                          <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]"></div>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-3 uppercase tracking-widest">A magia leva cerca de 1 minuto</p>
                      </div>
                    )}

                    {step === 'done' && (
                      <div className="w-full max-w-xs text-center">
                        <div className="text-green-500 text-sm font-bold uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
                          <i className="fa-solid fa-circle-check"></i> Escultura Finalizada
                        </div>
                        <button onClick={reset} className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors underline underline-offset-4">
                          Gerar nova miniatura
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: 3D VIEWER */}
            <div className="flex flex-col h-full space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-3 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs">2</span>
                Resultado 3D
              </h2>

              <div className="flex-1 min-h-[300px] lg:min-h-[400px] border border-zinc-800 rounded-xl bg-zinc-950 relative overflow-hidden flex items-center justify-center shadow-inner group">
                
                {step === 'idle' && (
                  <div className="text-center p-6 opacity-30">
                    <i className="fa-brands fa-unity text-6xl mb-4 text-zinc-600"></i>
                    <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">Aguardando Referência...</p>
                  </div>
                )}

                {(step === 'uploading' || step === 'generating') && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Cool 3D grid CSS background effect */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] [transform-origin:bottom]"></div>
                    
                    <div className="relative z-10 w-24 h-24 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin"></div>
                    <div className="absolute z-10 text-amber-500 opacity-50">
                      <i className="fa-solid fa-cube text-3xl animate-pulse"></i>
                    </div>
                  </div>
                )}

                {step === 'done' && modelUrl && (
                  <>
                    <ModelViewer
                      src={modelUrl}
                      alt="Modelo 3D Gerado"
                      auto-rotate
                      camera-controls
                      shadow-intensity="1"
                      exposure="1"
                      className="w-full h-full bg-zinc-900"
                      style={{ width: '100%', height: '100%' }}
                    ></ModelViewer>
                    
                    {/* Toolbar Overlay */}
                    <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/60 backdrop-blur-md border border-zinc-700/50 p-2 rounded-xl flex gap-2 shadow-2xl">
                        <button className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors tooltip" title="Ver Wireframe">
                          <i className="fa-solid fa-border-all"></i>
                        </button>
                        <button className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors" title="Modo Texturizado">
                          <i className="fa-solid fa-palette"></i>
                        </button>
                        <div className="w-px h-6 bg-zinc-700 my-auto mx-1"></div>
                        <a 
                          href={modelUrl} 
                          download="modelo_gerado.glb"
                          className="px-6 h-10 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-colors"
                        >
                          <i className="fa-solid fa-download"></i> Baixar STL / GLB
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
          </div>
          
        </div>
        
        {/* INFO SECTION */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-amber-500 flex items-center justify-center mb-3">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Rapidez Mágica</h4>
            <p className="text-xs text-zinc-500">Nosso algoritmo analisa texturas, profundidade e pose em menos de 1 minuto, entregando uma malha polígonal pronta para a resina.</p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-amber-500 flex items-center justify-center mb-3">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Alta Fidelidade</h4>
            <p className="text-xs text-zinc-500">Geração de texturas PBR completas e mapas de normais, perfeitos não só para impressão, mas para VTTs (Mesas Virtuais) como Talespire.</p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-amber-500 flex items-center justify-center mb-3">
              <i className="fa-solid fa-file-export"></i>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Formatos Universais</h4>
            <p className="text-xs text-zinc-500">Exporte os resultados finalizados em .GLB/.GLTF para visualização web ou converta instantaneamente para .STL para fatiadores 3D.</p>
          </div>
        </div>

      </section>

    </div>
  );
}
