import json
import os
from datetime import datetime
import uuid

class SistemaGestaoRPG:
    def __init__(self, arquivo_json="dados_loja.json"):
        self.arquivo_json = arquivo_json
        self.dados = {
            "produtos": [],
            "financeiro": [],
            "vendas": []
        }
        self._carregar_dados()

    def _carregar_dados(self):
        """Carrega os dados do arquivo JSON, ou cria um novo se não existir."""
        if os.path.exists(self.arquivo_json):
            try:
                with open(self.arquivo_json, 'r', encoding='utf-8') as f:
                    self.dados = json.load(f)
            except json.JSONDecodeError:
                print("Erro ao ler o arquivo JSON. Iniciando com dados vazios.")
        else:
            self._salvar_dados()

    def _salvar_dados(self):
        """Salva os dados atuais no arquivo JSON."""
        with open(self.arquivo_json, 'w', encoding='utf-8') as f:
            json.dump(self.dados, f, ensure_ascii=False, indent=4)

    def novo_produto(self, nome, categoria, preco, tipo="Cru"):
        """
        Registra um novo produto.
        Categoria: Ex: Miniatura, Escudo, One-Shot
        Tipo: Ex: Cru, Pintado
        """
        produto_id = str(uuid.uuid4())
        produto = {
            "id": produto_id,
            "nome": nome,
            "categoria": categoria,
            "tipo": tipo,
            "preco_base": preco
        }
        self.dados["produtos"].append(produto)
        self._salvar_dados()
        print(f"Produto '{nome}' registrado com sucesso! (ID: {produto_id})")
        return produto_id

    def registrar_gasto(self, descricao, valor, categoria_gasto):
        """
        Registra um gasto financeiro (Custo).
        Categoria: Ex: Insumo, Fixo, Equipamento
        """
        registro = {
            "data": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "tipo": "Custo",
            "descricao": descricao,
            "valor": float(valor),
            "categoria": categoria_gasto
        }
        self.dados["financeiro"].append(registro)
        self._salvar_dados()
        print(f"Gasto '{descricao}' no valor de R$ {valor:.2f} registrado com sucesso!")

    def registrar_venda(self, cliente, nome_produto, valor_pago):
        """
        Registra uma nova venda no CRM/Vendas e também como entrada no Financeiro.
        """
        # Registrar no CRM
        venda = {
            "data": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "cliente": cliente,
            "produto": nome_produto,
            "valor_final": float(valor_pago)
        }
        self.dados["vendas"].append(venda)
        
        # Registrar no Financeiro como Receita (Venda)
        registro_financeiro = {
            "data": venda["data"],
            "tipo": "Venda",
            "descricao": f"Venda de {nome_produto} para {cliente}",
            "valor": float(valor_pago),
            "categoria": "Receita Venda" # Categoria específica para diferenciar
        }
        self.dados["financeiro"].append(registro_financeiro)
        
        self._salvar_dados()
        print(f"Venda de '{nome_produto}' para '{cliente}' registrada com sucesso!")

    def relatorio_geral(self):
        """Calcula Receita Total, Despesas Totais e Lucro Líquido."""
        receita_total = sum(reg["valor"] for reg in self.dados["financeiro"] if reg["tipo"] == "Venda")
        despesas_totais = sum(reg["valor"] for reg in self.dados["financeiro"] if reg["tipo"] == "Custo")
        lucro_liquido = receita_total - despesas_totais

        print("\n" + "="*30)
        print("RELATÓRIO GERAL")
        print("="*30)
        print(f"Receita Total:   R$ {receita_total:.2f}")
        print(f"Despesas Totais: R$ {despesas_totais:.2f}")
        print(f"Lucro Líquido:   R$ {lucro_liquido:.2f}")
        print("="*30 + "\n")

    def balanco_por_categoria(self):
        """Detalha quanto foi gasto em cada categoria e quanto cada produto gerou."""
        gastos_por_categoria = {}
        receitas_por_produto = {}

        # Calcular gastos por categoria
        for registro in self.dados["financeiro"]:
            if registro["tipo"] == "Custo":
                cat = registro["categoria"]
                gastos_por_categoria[cat] = gastos_por_categoria.get(cat, 0.0) + registro["valor"]

        # Calcular receitas por produto
        for venda in self.dados["vendas"]:
            prod = venda["produto"]
            receitas_por_produto[prod] = receitas_por_produto.get(prod, 0.0) + venda["valor_final"]

        print("\n" + "="*40)
        print("BALANÇO POR CATEGORIA DE CUSTO")
        print("="*40)
        if not gastos_por_categoria:
            print("Nenhum custo registrado.")
        for cat, valor in gastos_por_categoria.items():
            print(f"- {cat}: R$ {valor:.2f}")

        print("\n" + "="*40)
        print("RECEITAS POR PRODUTO")
        print("="*40)
        if not receitas_por_produto:
            print("Nenhuma venda registrada.")
        for prod, valor in receitas_por_produto.items():
            print(f"- {prod}: R$ {valor:.2f}")
        print("="*40 + "\n")

# ==========================================
# Exemplo de Instanciação e Uso no Terminal
# ==========================================
if __name__ == "__main__":
    # 1. Instanciar o sistema
    # O arquivo dados_loja.json será criado no diretório atual automaticamente.
    sistema = SistemaGestaoRPG()

    print("--- REGISTRANDO PRODUTOS ---")
    sistema.novo_produto(nome="Miniatura Dragão Vermelho", categoria="Miniatura", preco=150.0, tipo="Pintado")
    sistema.novo_produto(nome="Escudo do Mestre Personalizado", categoria="Escudo", preco=85.0, tipo="Cru")
    sistema.novo_produto(nome="Aventura One-Shot: A Caverna Goblin", categoria="One-Shot", preco=25.0, tipo="Digital")

    print("\n--- REGISTRANDO GASTOS (INVESTIMENTO INICIAL E INSUMOS) ---")
    sistema.registrar_gasto(descricao="Impressora 3D de Resina", valor=2500.0, categoria_gasto="Equipamento")
    sistema.registrar_gasto(descricao="Garrafa de Resina 1L", valor=200.0, categoria_gasto="Insumo")
    sistema.registrar_gasto(descricao="Tinta Acrílica Conjunto", valor=120.0, categoria_gasto="Insumo")

    print("\n--- REGISTRANDO VENDAS ---")
    sistema.registrar_venda(cliente="João Pedro", nome_produto="Miniatura Dragão Vermelho", valor_pago=150.0)
    sistema.registrar_venda(cliente="Maria Silva", nome_produto="Escudo do Mestre Personalizado", valor_pago=90.0)
    sistema.registrar_venda(cliente="Carlos", nome_produto="Miniatura Dragão Vermelho", valor_pago=150.0)
    sistema.registrar_venda(cliente="Ana", nome_produto="Aventura One-Shot: A Caverna Goblin", valor_pago=25.0)

    print("\n--- GERANDO RELATÓRIOS ---")
    sistema.relatorio_geral()
    sistema.balanco_por_categoria()
