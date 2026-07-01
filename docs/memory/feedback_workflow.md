---
name: feedback-workflow
description: Divisão de trabalho entre Bernardo (backend) e colega (frontend) — como estruturar entregas
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e83aa46d-d511-489f-b935-099adfc56c3f
---

Bernardo faz **apenas o backend**. Toda vez que uma tarefa envolver frontend (React/TSX), não implementar — em vez disso, gerar um **prompt completo em português** com instruções claras e objetivas para a colega aplicar na branch dela.

**Why:** A colega trabalha em uma branch separada no frontend. Claude não deve tocar em arquivos .tsx/.ts de UI diretamente.

**How to apply:** Ao final de cada entrega de backend, ou ao identificar que a próxima etapa é frontend, escrever um prompt autocontido que inclua:
- O que foi feito no backend (endpoints, payloads de resposta)
- O que a colega precisa implementar no frontend
- Onde implementar (arquivo/componente)
- Comportamento esperado (estados, UX, dados a exibir)
