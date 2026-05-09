import { pool } from '../../db/pool'

export async function getDashboardData(eventId: string) {
  // 📊 KPIs
  const kpisQuery = await pool.query(
    `
    SELECT 
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(o.total_amount), 0) as total_revenue,
      COUNT(t.id) as total_tickets,
      COUNT(c.checked_in_at) as total_checkins
    FROM orders o
    LEFT JOIN tickets t ON t.order_id = o.id
    LEFT JOIN checkins c ON c.ticket_id = t.id
    WHERE o.event_id = $1
    AND o.status = 'PAID'
    `,
    [eventId]
  )

  const kpis = kpisQuery.rows[0]

  const totalTickets = Number(kpis.total_tickets || 0)
  const totalCheckins = Number(kpis.total_checkins || 0)

  const attendanceRate =
    totalTickets > 0
      ? Number(((totalCheckins / totalTickets) * 100).toFixed(1))
      : 0

  // 📈 Vendas por dia
  const salesByDayQuery = await pool.query(
    `
    SELECT 
      DATE(o.created_at) as date,
      COUNT(o.id) as orders,
      COALESCE(SUM(o.total_amount), 0) as revenue
    FROM orders o
    WHERE o.event_id = $1
    AND o.status = 'PAID'
    GROUP BY DATE(o.created_at)
    ORDER BY date ASC
    `,
    [eventId]
  )

  // 📋 Últimas vendas
  const recentSalesQuery = await pool.query(
    `
    SELECT 
      o.id,
      o.buyer_name,
      o.total_amount as amount,
      o.status,
      o.created_at
    FROM orders o
    WHERE o.event_id = $1
    ORDER BY o.created_at DESC
    LIMIT 10
    `,
    [eventId]
  )

  return {
    kpis: {
      totalOrders: Number(kpis.total_orders),
      totalRevenue: Number(kpis.total_revenue),
      totalTickets: totalTickets,
      totalCheckins: totalCheckins,
      attendanceRate
    },

    salesByDay: salesByDayQuery.rows,

    recentSales: recentSalesQuery.rows
  }
}