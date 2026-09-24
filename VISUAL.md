# 🎨 PRÉVIA VISUAL DO APP

## 📱 Como o App Fica

### **TELA PRINCIPAL - HOME**

```
┌─────────────────────────────────┐
│ 🎉 Localiza a Berlinda          │  ← Header (roxo)
│ Rastreamento em Tempo Real      │
└─────────────────────────────────┘
│                                 │
│      [    MAPA      ]            │  ← Seção Mapa
│   📍 Localização obtida         │     (300px altura)
│                                 │
├─────────────────────────────────┤
│ 📏 Distância Total   ✅ Percorrida│  ← Cards (grid 2x2)
│ 5.00 km              0.50 km     │
│                                 │
│ 🎯 Faltam            ⏱️ Tempo     │
│ 4.50 km              00:15:30    │
├─────────────────────────────────┤
│                                 │
│ [▶️ Iniciar Rastreamento]       │  ← Botões
│ [🔄 Resetar] [ℹ️ Informações]   │
│                                 │
├─────────────────────────────────┤
│ 🎊 Desenvolvido com ❤️          │  ← Footer
│    para sua procissão           │
└─────────────────────────────────┘
```

---

## 🎨 PALETA DE CORES

```
┌──────────────┐
│ Header       │  Gradiente #667eea → #764ba2 (Roxo/Magenta)
└──────────────┘

┌──────────────┐
│ Card 1       │  #667eea (Azul)     - Distância Total
└──────────────┘

┌──────────────┐
│ Card 2       │  #48bb78 (Verde)    - Distância Percorrida
└──────────────┘

┌──────────────┐
│ Card 3       │  #f6ad55 (Laranja)  - Distância Restante
└──────────────┘

┌──────────────┐
│ Card 4       │  #ed8936 (Laranja+) - Tempo Decorrido
└──────────────┘

┌──────────────┐
│ Background   │  #f5f7fa (Cinza claro)
└──────────────┘
```

---

## 📐 LAYOUT RESPONSIVO

### **MOBILE (até 767px)**

```
Largura total = 100%

┌─────────────┐
│   Header    │ 100% width
├─────────────┤
│             │
│    Mapa     │ 100% width, 300px height
│             │
├─────────────┤
│ Card  │Card │ 50% | 50%
│       │     │
├─────────────┤
│ Card  │Card │ 50% | 50%
│       │     │
├─────────────┤
│  Botão      │ 100% width
│  Botão      │ 100% width
│  Botão  Btn │ 50% | 50%
├─────────────┤
│   Footer    │ 100% width
└─────────────┘
```

### **TABLET/DESKTOP (768px+)**

```
Largura até 1200px

┌──────────────────────────────────┐
│          Header                  │ 100% width
├──────────────────────────────────┤
│                                  │
│           Mapa                   │ 100% width, 400px height
│                                  │
├──────────────────────────────────┤
│ Card1  │ Card2  │ Card3 │ Card4 │ 25% | 25% | 25% | 25%
│        │        │       │       │
├──────────────────────────────────┤
│ Botão1 │ Botão2 │ Botão3│Botão4 │ 25% | 25% | 25% | 25%
├──────────────────────────────────┤
│          Footer                  │ 100% width
└──────────────────────────────────┘
```

---

## 🎬 INTERAÇÕES

### **Ao Abrir o App:**
```
1. Splash screen 💫
   ↓
2. Header com título 🎉
   ↓
3. Mapa em branco/grid
   ↓
4. 4 Cards com valores 0
   ↓
5. 4 Botões cinzas/desativados
   ↓
6. "Aguardando localização..." 📍
```

### **Ao Clicar "Iniciar":**
```
1. Botão desaparece
   ↓
2. Mapa começa a desenhar rota (azul #667eea)
   ↓
3. Cards começam a atualizar em tempo real
   ↓
4. Cronômetro começa a rodar
   ↓
5. Botão "Parar" aparece (vermelho #f56565)
```

### **Ao Clicar no Card:**
```
Sem efeito no mobile
MAS em desktop:
  └─ Card sobre 2px (sombra aumenta)
  └─ Cor texto fica mais intensa
```

### **Ao Clicar "ℹ️ Informações":**
```
1. Fundo escurece (overlay com opacidade 0.4)
   ↓
2. Modal aparece no centro com slide-down
   ↓
3. Conteúdo com:
   - Título "Sobre a Procissão"
   - Descrição
   - Como funciona
   - Requisitos
   - Versão
   ↓
4. Botão X no canto para fechar
```

### **Ao Clicar "Parar":**
```
1. GPS para de atualizar
   ↓
2. Mapa congela a rota
   ↓
3. Cronômetro para
   ↓
4. Botão "Parar" desaparece
   ↓
5. Botão "Iniciar" reaparece
   ↓
6. Status: "⏸️ Rastreamento parado"
```

---

## 📊 VALORES INICIAIS

### **Antes de Iniciar:**
```
Distância Total:    5.00 km  (configurável)
Distância Percorrida: 0 km
Distância Restante:   5.00 km
Tempo Decorrido:      00:00:00
Status:              "Aguardando localização..."
```

### **Durante Rastreamento (exemplo):**
```
Distância Total:    5.00 km
Distância Percorrida: 1.23 km  (aumenta com movimento)
Distância Restante:   3.77 km  (diminui)
Tempo Decorrido:      00:12:45 (aumenta a cada 1s)
Status:              "📍 Localização obtida (precisão: 5m)"
```

### **Após Parar:**
```
Distância Total:    5.00 km
Distância Percorrida: 3.15 km  (parou de atualizar)
Distância Restante:   1.85 km
Tempo Decorrido:      00:45:30 (parou)
Status:              "⏸️ Rastreamento parado"
```

---

## 🎨 ANIMAÇÕES

### **Loading (Pulsação)**
```css
@keyframes pulse {
  0%:   opacity: 1.0
  50%:  opacity: 0.5
  100%: opacity: 1.0
}

Duração: 1.5 segundos, infinito
Onde:    "🗺️ Carregando mapa..."
```

### **Card Hover (Desktop)**
```css
box-shadow: 0px 2px 8px → 0px 4px 12px
transform: translateY(0px) → translateY(-2px)
Transição: 0.3 segundos
```

### **Modal Entrada**
```css
@keyframes slideIn {
  0%:   transform: translateY(-50px), opacity: 0
  100%: transform: translateY(0px),   opacity: 1
}
Duração: 0.3 segundos
```

### **Modal Fundo**
```css
@keyframes fadeIn {
  0%:   opacity: 0
  100%: opacity: 0.4
}
Duração: 0.3 segundos
```

---

## 🎯 ESTADOS DOS BOTÕES

### **Antes de Iniciar:**
```
┌─────────────────────────────────┐
│ ▶️ INICIAR RASTREAMENTO (Roxo)  │  ← Ativo (clicável)
├─────────────────────────────────┤
│ 🔄 RESETAR        │ ℹ️ INFORMAÇÕES│  ← Cinzas (sempre disponíveis)
└─────────────────────────────────┘
```

### **Durante Rastreamento:**
```
┌─────────────────────────────────┐
│ ⏹️ PARAR RASTREAMENTO (Vermelho)│  ← Ativo (clicável)
├─────────────────────────────────┤
│ 🔄 RESETAR        │ ℹ️ INFORMAÇÕES│  ← Cinzas (sempre disponíveis)
└─────────────────────────────────┘
```

---

## 📱 RESPONSIVIDADE

### **Breakpoints:**
- **Máx 600px:**  Celular pequeno (2 colunas)
- **600-768px:**  Celular grande (2 colunas)
- **768-1024px:** Tablet (4 colunas)
- **1024px+:**    Desktop (4 colunas, mais espaçamento)

### **Ajustes por Tamanho:**

```
Celular:     Cards em grid 2x2, botões largura cheia
Tablet:      Cards em grid 4x1, botões lado a lado
Desktop:     Mesmo que tablet, mais margem externa
```

---

## 🎭 MODAL DE INFORMAÇÕES

```
┌──────────────────────────────────┐
│ ✕                                │  ← Botão fechar (canto)
├──────────────────────────────────┤
│ Sobre a Procissão                │  ← Título
├──────────────────────────────────┤
│                                  │
│ 🎉 Berlinda - Rainha da Procissão│
│                                  │
│ Este aplicativo rastreia em      │
│ tempo real a localização da      │
│ berlinda (carruagem festiva)     │
│ durante a procissão.             │
│                                  │
│ 📍 Como Funciona:                │
│ • GPS em Tempo Real              │
│ • Cálculo de Distâncias          │
│ • Cronômetro                     │
│ • Mapa Interativo                │
│                                  │
│ ⚙️ Requisitos:                    │
│ • GPS ativado                    │
│ • Conexão com internet           │
│ • Permissão de localização       │
│                                  │
│ 👨‍💻 Versão:                       │
│ v1.0.0                           │
│                                  │
└──────────────────────────────────┘
```

---

## 🗺️ MAPA

### **Sem Internet (Canvas):**
```
Grid cinzento com texto:
┌─────────────────────────────┐
│                             │
│  🗺️ Mapa em Tempo Real      │
│     São Paulo - SP          │
│                             │
│                             │
└─────────────────────────────┘
```

### **Com Internet (Leaflet/OpenStreetMap):**
```
Mapa real com:
┌─────────────────────────────┐
│  ┌┐                         │
│ ┌┴┐ Controles zoom         │
│ │X│ Botão fechar          │
│ └─┘                         │
│                             │
│  Mapa com rota desenhada   │
│  Marcadores nas posições   │
│                             │
│ © OpenStreetMap contributors
└─────────────────────────────┘
```

### **Rota Desenhada:**
- Cor: **#667eea** (azul/roxo)
- Espessura: **4px**
- Opacidade: **0.8** (80%)
- Estilo: Linha contínua

### **Marcadores:**
- **Início:** Verde #48bb78
- **Atual:** Azul #667eea
- **Intermediários:** Cinza #cbd5e0

---

## 📲 DIMENSÕES

```
Header:         altura 80px
Mapa:           altura 300px (mobile) / 400px (desktop)
Cards:          altura 80px cada
Botões:         altura 48px cada
Modal:          largura 90% (mobile) / 600px (desktop)
Footer:         altura 50px
```

---

## 🎨 TIPOGRAFIA

```
Título (h1):           28px, bold, #ffffff, shadow
Subtítulo:             13px, normal, #ffffff
Card Title (h3):       12px, bold, #666666, uppercase
Card Value:            20px, bold, colorida
Card Unit:             11px, italic, #999999
Modal Title (h2):      20px, bold, #667eea
Modal Subtitle (h3):   16px, bold, #2d3748
Modal Body:            13px, normal, #718096
```

---

## ✅ CHECKLIST VISUAL

Quando abrir app, veja se tem:

- [ ] Header roxo/magenta com título
- [ ] Mapa (cinzento ou real)
- [ ] 4 cards com ícones (📏 ✅ 🎯 ⏱️)
- [ ] Valores mostram "0" ou "-"
- [ ] 3 botões (Iniciar, Resetar, Informações)
- [ ] Rodapé cinza escuro
- [ ] Fonte grande e legível
- [ ] Cores match da documentação

---

## 🎬 ANIMAÇÃO COMPLETA

```
0s:   App abre, header aparece
0.3s: Cards sleidam de cima
0.6s: Botões aparecem (fade)
1s:   Mapa começa a carregar
2s:   "Aguardando localização..." pisca
5s:   GPS obtém posição, mapa renderiza
10s:  Usuário clica "Iniciar"
10.3s: Botão "Parar" aparece (slide)
10.5s: Mapa desenha primeiro ponto
11s:  Cards começam atualizar (valores mudam)
12s:  Cronômetro começa rodar
...
50s:  Usuário clica "Parar"
50.3s: Botão "Parar" desaparece, "Iniciar" volta
```

---

**Desenvolvido com ❤️**  
**Versão Visual:** 1.0.0  
**Data:** Janeiro 2026
