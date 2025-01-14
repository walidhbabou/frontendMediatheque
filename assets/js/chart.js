document.addEventListener('DOMContentLoaded', function () {
    // Fetch documents from the API
    fetch('http://localhost:8080/Mediatheque/Document/getAllDocuments')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des documents.');
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Vérifiez les données reçues

            // Extract titles and available quantities for Chart.js
            const labels = data.map(doc => doc.titre);
            const dataset = data.map(doc => doc.quantite_disponible);

            // Prepare data for Chart.js
            const chartData = {
                labels: labels,
                datasets: [{
                    label: 'Quantité disponible',
                    data: dataset,
                    borderColor: '#5e72e4',
                    backgroundColor: 'rgba(94, 114, 228, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            };

            // Options for the chart
            const options = {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#ddd'
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            };

            // Render the chart
            const ctx = document.getElementById('chart-line').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: options
            });
        })
        .catch(error => console.error('Erreur :', error));
});