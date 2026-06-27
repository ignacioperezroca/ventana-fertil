# Matriz de eventos Stripe

| Evento | Acción |
|---|---|
| `checkout.session.completed` | Vincula customer y recupera la suscripción; no confía en el redirect. |
| `customer.subscription.created` | Upsert completo de suscripción. |
| `customer.subscription.updated` | Actualiza estado, período y cancelación. |
| `customer.subscription.deleted` | Guarda `canceled` y revoca Premium. |
| `invoice.paid` | Recupera la suscripción y refresca entitlement. |
| `invoice.payment_failed` | Recupera la suscripción y refleja `past_due`/estado Stripe. |

Cada evento se registra por ID. Un evento exitoso repetido devuelve 200 sin reprocesar; un evento con error puede reintentarse.
