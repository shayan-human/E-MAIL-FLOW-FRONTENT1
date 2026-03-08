export function processChartData(activityData: any[]) {
    // 30D and 7D
    const dailyStats: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyStats[d.toISOString().split('T')[0]] = 0;
    }

    // 24H
    const hourlyStats: Record<string, number> = {};
    for (let i = 0; i < 24; i++) {
        const d = new Date();
        d.setHours(d.getHours() - i);
        const hourKey = d.toISOString().substring(0, 13); // "YYYY-MM-DDTHH"
        hourlyStats[hourKey] = 0;
    }

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    activityData.forEach((lead: any) => {
        if (!lead.sent_at) return;

        // Daily
        const dateStr = lead.sent_at.split('T')[0];
        if (dailyStats[dateStr] !== undefined) dailyStats[dateStr]++;

        // Hourly
        const sentDt = new Date(lead.sent_at);
        if (sentDt >= twentyFourHoursAgo) {
            const hourKey = sentDt.toISOString().substring(0, 13);
            if (hourlyStats[hourKey] !== undefined) {
                hourlyStats[hourKey]++;
            }
        }
    });

    const chartData30D = Object.entries(dailyStats)
        .map(([date, count]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sent: count,
            fullDate: date
        }))
        .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

    const chartData7D = chartData30D.slice(-7);

    const chartData24H = Object.entries(hourlyStats)
        .map(([hourKey, count]) => {
            const d = new Date(hourKey + ":00:00Z");
            return {
                date: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), // "14:00"
                sent: count,
                fullDate: hourKey
            };
        })
        .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

    return { "24H": chartData24H, "7D": chartData7D, "30D": chartData30D };
}

export function processBestSendDay(leads: any[]) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: Record<string, number> = {
        'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };

    leads.forEach(lead => {
        if (!lead.sent_at || lead.status !== 'REPLIED') return;
        const day = dayNames[new Date(lead.sent_at).getDay()];
        if (counts[day] !== undefined) counts[day]++;
    });

    const data = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        day,
        replies: counts[day]
    }));

    const maxReplies = Math.max(...data.map(d => d.replies));

    return data.map(d => ({
        ...d,
        isHighest: maxReplies > 0 && d.replies === maxReplies
    }));
}
