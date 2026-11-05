# Design / UX

## Identidade
- Verde Unoeste repaginado: o verde institucional (~#2E7D32 do header original) como `primary` no tema do Tailwind.
- Layout moderno: cards, cantos arredondados, espaçamento generoso, tipografia limpa (ex.: Inter).
- Ícones por tipo de material (pdf, zip, link, doc) no lugar das imagens antigas.

## Requisitos de UX (decididos)
- [ ] **Modo escuro**: `darkMode: 'class'` no Tailwind; na primeira visita segue o sistema operacional (`prefers-color-scheme`), depois vale a escolha salva no localStorage.
- [ ] **Responsivo/mobile**: o menu lateral da disciplina vira drawer; o calendário se adapta.
- [ ] **Notificações in-app**: sino no header com contador; criadas no backend quando surge novo material, nota ou evento (recurso `Notificacao`, com marcar como lida).
- [ ] **Barra de progresso por disciplina**: % de materiais concluídos pelo aluno, exibida no card da home.
- [ ] **Acessibilidade**: widget oficial VLibras; contraste AA, foco visível, `alt` em imagens, navegação por teclado.
- Selo com o papel do usuário (Aluno/Professor/Admin) no lugar da aba "✓ ALUNO".

## Melhorias em relação ao original
- Home com cards de disciplina (progresso + próximos eventos) em vez de lista de links.
- Assistente de IA nativo no lugar do botão que leva ao ChatGPT externo.
