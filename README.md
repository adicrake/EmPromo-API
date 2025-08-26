
# EmPromo API (sem login) — Deploy no Render
1) **Deploy no Render**
   - New Web Service → conectar repositório
   - Build Command: *(deixe em branco)*
   - Start Command: `npm start`
   - Runtime: Node 18+
2) Endpoints principais
   - GET  /promotions?status=active|expired|all&ends=today&q=...
   - POST /promotions  (criar promoção)
   - PUT  /promotions/:id
   - DELETE /promotions/:id
   - POST /promotions/:id/click
   - POST /promotions/:id/comment
Nota: Sem autenticação — ideal apenas para MVP.
