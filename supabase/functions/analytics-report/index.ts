import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ReportQuery {
  start_date?: string;
  end_date?: string;
  event_types?: string[];
  user_id?: string;
  report_type: 'summary' | 'detailed' | 'revenue' | 'conversion';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { start_date, end_date, event_types, user_id, report_type }: ReportQuery = await req.json();

    // Default date range (last 30 days)
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let reportData: any = {};

    switch (report_type) {
      case 'summary':
        // Get event counts by type
        const { data: eventCounts } = await supabase
          .from('analytics_events')
          .select('event_name')
          .gte('timestamp', startDate.toISOString())
          .lte('timestamp', endDate.toISOString());

        const eventSummary = eventCounts?.reduce((acc: any, event: any) => {
          acc[event.event_name] = (acc[event.event_name] || 0) + 1;
          return acc;
        }, {}) || {};

        reportData = {
          period: { start_date: startDate, end_date: endDate },
          total_events: eventCounts?.length || 0,
          event_breakdown: eventSummary
        };
        break;

      case 'revenue':
        // Get revenue data from booking completions
        const { data: revenueEvents } = await supabase
          .from('analytics_events')
          .select('metadata, timestamp')
          .eq('event_name', 'complete_booking')
          .gte('timestamp', startDate.toISOString())
          .lte('timestamp', endDate.toISOString());

        const totalRevenue = revenueEvents?.reduce((sum: number, event: any) => {
          return sum + (parseFloat(event.metadata?.revenue) || 0);
        }, 0) || 0;

        const dailyRevenue = revenueEvents?.reduce((acc: any, event: any) => {
          const date = new Date(event.timestamp).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + (parseFloat(event.metadata?.revenue) || 0);
          return acc;
        }, {}) || {};

        reportData = {
          period: { start_date: startDate, end_date: endDate },
          total_revenue: totalRevenue,
          total_bookings: revenueEvents?.length || 0,
          average_booking_value: revenueEvents?.length ? totalRevenue / revenueEvents.length : 0,
          daily_revenue: dailyRevenue
        };
        break;

      case 'conversion':
        // Calculate conversion funnel
        const { data: funnelEvents } = await supabase
          .from('analytics_events')
          .select('event_name, session_id, timestamp')
          .in('event_name', ['view_home', 'view_trip', 'click_join', 'start_booking', 'complete_booking'])
          .gte('timestamp', startDate.toISOString())
          .lte('timestamp', endDate.toISOString())
          .order('timestamp', { ascending: true });

        const sessionFunnels = funnelEvents?.reduce((acc: any, event: any) => {
          if (!acc[event.session_id]) {
            acc[event.session_id] = [];
          }
          acc[event.session_id].push(event.event_name);
          return acc;
        }, {}) || {};

        const funnelSteps = ['view_home', 'view_trip', 'click_join', 'start_booking', 'complete_booking'];
        const conversionData = funnelSteps.reduce((acc: any, step: string, index: number) => {
          const sessionsWithStep = Object.values(sessionFunnels).filter((steps: any) => 
            steps.includes(step)
          ).length;
          
          acc[step] = {
            count: sessionsWithStep,
            conversion_rate: index === 0 ? 100 : 
              Object.values(sessionFunnels).length > 0 ? 
              (sessionsWithStep / Object.values(sessionFunnels).length) * 100 : 0
          };
          return acc;
        }, {});

        reportData = {
          period: { start_date: startDate, end_date: endDate },
          total_sessions: Object.keys(sessionFunnels).length,
          conversion_funnel: conversionData
        };
        break;

      case 'detailed':
      default:
        // Get detailed event data
        let query = supabase
          .from('analytics_events')
          .select('*')
          .gte('timestamp', startDate.toISOString())
          .lte('timestamp', endDate.toISOString())
          .order('timestamp', { ascending: false })
          .limit(1000);

        if (event_types && event_types.length > 0) {
          query = query.in('event_name', event_types);
        }

        if (user_id) {
          query = query.eq('user_id', user_id);
        }

        const { data: detailedEvents } = await query;

        reportData = {
          period: { start_date: startDate, end_date: endDate },
          events: detailedEvents || []
        };
        break;
    }

    return new Response(
      JSON.stringify(reportData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Analytics report error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});