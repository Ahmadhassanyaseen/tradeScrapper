document.addEventListener('DOMContentLoaded', async function() {
    // Fetch data from the past hour
    const response = await fetch('/api/data');
    const priceData = await response.json();

    // Prepare data for charts
    const timestamps = priceData.map(d => new Date(d.timestamp).toLocaleTimeString());
    const prices = priceData.map(d => d.binancePrice);
    const volumes = priceData.map(d => d.volume);

    // Common chart options
    const commonOptions = {
        responsive: true,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                        size: 14
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                }
            }
        }
    };

    // Price Chart
    const priceChart = new Chart(document.getElementById('priceChart'), {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Solana Price (USD)',
                data: prices,
                borderColor: 'rgb(32, 129, 240)',
                backgroundColor: 'rgba(32, 129, 240, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: 'rgb(32, 129, 240)',
                pointBorderColor: '#fff',
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgb(32, 129, 240)',
                pointHoverBorderColor: '#fff'
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            },
            plugins: {
                ...commonOptions.plugins,
                title: {
                    display: true,
                    text: 'Solana Price History (Last Hour)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            }
        }
    });

    // Volume Chart
    const volumeChart = new Chart(document.getElementById('volumeChart'), {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: '24h Trading Volume (USD)',
                data: volumes,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: '#fff',
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgb(75, 192, 192)',
                pointHoverBorderColor: '#fff'
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + (value / 1000000).toFixed(2) + 'M';
                        }
                    }
                }
            },
            plugins: {
                ...commonOptions.plugins,
                title: {
                    display: true,
                    text: 'Trading Volume History (Last Hour)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            }
        }
    });

    // Real-time updates
    setInterval(async () => {
        const response = await fetch('/api/solana/latest');
        const latestData = await response.json();
        
        // Update price displays with animation
        animateValue('binance-price', latestData.binancePrice);
        animateValue('gecko-price', latestData.geckoPrice);
        animateValue('market-cap', latestData.marketCap / 1000000000, 'B');

        // Update charts
        const newTime = new Date(latestData.timestamp).toLocaleTimeString();
        
        // Remove oldest data point if we have more than 60 points (1 point per minute for 1 hour)
        if (priceChart.data.labels.length >= 60) {
            priceChart.data.labels.shift();
            priceChart.data.datasets[0].data.shift();
        }
        if (volumeChart.data.labels.length >= 60) {
            volumeChart.data.labels.shift();
            volumeChart.data.datasets[0].data.shift();
        }

        // Add new data points
        priceChart.data.labels.push(newTime);
        priceChart.data.datasets[0].data.push(latestData.binancePrice);
        priceChart.update('none'); // Use 'none' for smoother updates

        volumeChart.data.labels.push(newTime);
        volumeChart.data.datasets[0].data.push(latestData.volume);
        volumeChart.update('none');
    }, 60000); // Update every minute
});

// Helper function to animate value changes
function animateValue(elementId, newValue, suffix = '') {
    const element = document.getElementById(elementId);
    const currentValue = parseFloat(element.textContent.replace(/[^0-9.-]+/g, ''));
    const duration = 1000; // Animation duration in milliseconds
    const steps = 60; // Number of steps in animation
    const step = (newValue - currentValue) / steps;
    let current = currentValue;
    let i = 0;

    const animation = setInterval(() => {
        current += step;
        i++;
        element.textContent = `$${current.toFixed(2)}${suffix}`;
        
        if (i >= steps) {
            clearInterval(animation);
            element.textContent = `$${newValue.toFixed(2)}${suffix}`;
        }
    }, duration / steps);
} 