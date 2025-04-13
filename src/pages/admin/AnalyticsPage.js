// src/pages/admin/AnalyticsPage.js
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { firebaseService } from '../../services/firebase';
import { getDatabase, ref, get } from 'firebase/database';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    operations: [],
    popularChemicals: [],
    deviceUsage: []
  });
  
  const [dateRange, setDateRange] = useState('month'); // day, week, month, year
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [devices, setDevices] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch devices
        const devicesData = await firebaseService.getAvailableDevices();
        setDevices(devicesData);
        
        // Fetch operations for each device
        const operationsPromises = devicesData.map(async (device) => {
          try {
            const db = getDatabase();
            const operationsRef = ref(db, `${device.id}/dispensing_operations`);
            const snapshot = await get(operationsRef);
            
            if (!snapshot.exists()) return [];
            
            const operations = [];
            snapshot.forEach(childSnapshot => {
              operations.push({
                id: childSnapshot.key,
                deviceId: device.id,
                deviceName: device.name || device.id,
                ...childSnapshot.val()
              });
            });
            
            return operations;
          } catch (err) {
            console.error(`Error fetching operations for device ${device.id}:`, err);
            return [];
          }
        });
        
        const allOperations = (await Promise.all(operationsPromises)).flat();
        
        // Process data for charts
        const processedData = processDataForCharts(allOperations, dateRange, selectedDevice);
        setAnalyticsData(processedData);
        
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Ошибка при загрузке аналитических данных');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dateRange, selectedDevice]);
  
  // Process data for charts
  const processDataForCharts = (operations, range, deviceFilter) => {
    // Filter operations by device if needed
    const filteredOperations = deviceFilter === 'all' 
      ? operations 
      : operations.filter(op => op.deviceId === deviceFilter);
    
    // Filter operations by date range
    const now = new Date();
    const rangeDate = new Date();
    
    switch (range) {
      case 'day':
        rangeDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        rangeDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        rangeDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        rangeDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        rangeDate.setMonth(now.getMonth() - 1); // Default to month
    }
    
    const dateFilteredOperations = filteredOperations.filter(op => 
      new Date(op.timestamp) >= rangeDate
    );
    
    // Sort operations by date (oldest first)
    const sortedOperations = dateFilteredOperations.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Prepare data for revenue chart (by date)
    const revenueData = prepareRevenueData(sortedOperations, range);
    
    // Prepare data for operations chart (by date)
    const operationsData = prepareOperationsData(sortedOperations, range);
    
    // Prepare data for popular chemicals pie chart
    const popularChemicalsData = preparePopularChemicalsData(sortedOperations);
    
    // Prepare data for device usage bar chart
    const deviceUsageData = prepareDeviceUsageData(sortedOperations);
    
    return {
      revenue: revenueData,
      operations: operationsData,
      popularChemicals: popularChemicalsData,
      deviceUsage: deviceUsageData
    };
  };
  
  // Prepare revenue data by date
  const prepareRevenueData = (operations, range) => {
    const dateFormat = getDateFormat(range);
    const revenueByDate = {};
    
    operations.forEach(op => {
      const date = formatDate(new Date(op.timestamp), dateFormat);
      
      const pricePerLiter = op.price_per_liter || 0;
      const volumeInLiters = (op.volume || 0) / 1000; // Convert ml to liters
      const revenue = pricePerLiter * volumeInLiters;
      
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      
      revenueByDate[date] += revenue;
    });
    
    // Fill in missing dates within the range
    const filledData = fillMissingDates(revenueByDate, range);
    
    return {
      labels: Object.keys(filledData),
      datasets: [
        {
          label: 'Выручка (тенге)',
          data: Object.values(filledData),
          borderColor: 'rgba(46, 204, 113, 1)',
          backgroundColor: 'rgba(46, 204, 113, 0.2)',
          fill: true
        }
      ]
    };
  };
  
  // Prepare operations count data by date
  const prepareOperationsData = (operations, range) => {
    const dateFormat = getDateFormat(range);
    const opsByDate = {};
    
    operations.forEach(op => {
      const date = formatDate(new Date(op.timestamp), dateFormat);
      
      if (!opsByDate[date]) {
        opsByDate[date] = 0;
      }
      
      opsByDate[date] += 1;
    });
    
    // Fill in missing dates within the range
    const filledData = fillMissingDates(opsByDate, range);
    
    return {
      labels: Object.keys(filledData),
      datasets: [
        {
          label: 'Количество операций',
          data: Object.values(filledData),
          borderColor: 'rgba(52, 152, 219, 1)',
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          fill: true
        }
      ]
    };
  };
  
  // Prepare popular chemicals data
  const preparePopularChemicalsData = (operations) => {
    const chemicalUsage = {};
    
    operations.forEach(op => {
      const chemicalName = op.chemical_name || 'Неизвестно';
      
      if (!chemicalUsage[chemicalName]) {
        chemicalUsage[chemicalName] = 0;
      }
      
      chemicalUsage[chemicalName] += 1;
    });
    
    // Sort by usage (descending) and take top 5
    const sortedChemicals = Object.entries(chemicalUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const labels = sortedChemicals.map(([name]) => name);
    const data = sortedChemicals.map(([, count]) => count);
    
    // Generate colors
    const colors = [
      'rgba(46, 204, 113, 0.7)',
      'rgba(52, 152, 219, 0.7)',
      'rgba(155, 89, 182, 0.7)',
      'rgba(241, 196, 15, 0.7)',
      'rgba(230, 126, 34, 0.7)'
    ];
    
    return {
      labels,
      datasets: [
        {
          label: 'Использований',
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare device usage data
  const prepareDeviceUsageData = (operations) => {
    const deviceUsage = {};
    
    operations.forEach(op => {
      const deviceName = op.deviceName || op.deviceId || 'Неизвестно';
      
      if (!deviceUsage[deviceName]) {
        deviceUsage[deviceName] = 0;
      }
      
      deviceUsage[deviceName] += 1;
    });
    
    // Sort by usage (descending)
    const sortedDevices = Object.entries(deviceUsage)
      .sort((a, b) => b[1] - a[1]);
    
    const labels = sortedDevices.map(([name]) => name);
    const data = sortedDevices.map(([, count]) => count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Количество операций',
          data,
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 1
        }
      ]
    };
  };
  
  // Fill in missing dates in a date range
  const fillMissingDates = (dataByDate, range) => {
    const result = { ...dataByDate };
    const now = new Date();
    const rangeDate = new Date();
    const dateFormat = getDateFormat(range);
    
    switch (range) {
      case 'day':
        rangeDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        rangeDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        rangeDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        rangeDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        rangeDate.setMonth(now.getMonth() - 1);
    }
    
    const currentDate = new Date(rangeDate);
    while (currentDate <= now) {
      const dateKey = formatDate(currentDate, dateFormat);
      
      if (!result[dateKey]) {
        result[dateKey] = 0;
      }
      
      // Increment date based on range
      if (range === 'day') {
        currentDate.setHours(currentDate.getHours() + 1);
      } else if (range === 'week') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (range === 'month') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (range === 'year') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    // Sort keys chronologically
    return Object.keys(result)
      .sort((a, b) => {
        if (range === 'day') {
          return parseInt(a.split(':')[0]) - parseInt(b.split(':')[0]);
        }
        return a.localeCompare(b);
      })
      .reduce((obj, key) => {
        obj[key] = result[key];
        return obj;
      }, {});
  };
  
  // Get date format based on range
  const getDateFormat = (range) => {
    switch (range) {
      case 'day':
        return 'hour';
      case 'week':
        return 'day';
      case 'month':
        return 'day';
      case 'year':
        return 'month';
      default:
        return 'day';
    }
  };
  
  // Format date based on format type
  const formatDate = (date, format) => {
    switch (format) {
      case 'hour':
        return `${date.getHours()}:00`;
      case 'day':
        return `${date.getDate()}.${date.getMonth() + 1}`;
      case 'month':
        const monthNames = [
          'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
          'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
        ];
        return monthNames[date.getMonth()];
      default:
        return date.toLocaleDateString();
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateRange') {
      setDateRange(value);
    } else if (name === 'device') {
      setSelectedDevice(value);
    }
  };
  
  if (loading) {
    return (
      <AdminLayout title="Аналитика">
        <div className="eco-loader-container">
          <Loader size="large" text="Загрузка аналитических данных..." />
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout title="Аналитика">
        <ErrorMessage message={error} />
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Аналитика">
      <div className="eco-analytics-container">
        {/* Filters */}
        <div className="eco-analytics-filters">
          <div className="eco-filter-group">
            <label htmlFor="dateRange">Период:</label>
            <select
              id="dateRange"
              name="dateRange"
              value={dateRange}
              onChange={handleFilterChange}
              className="eco-select"
            >
              <option value="day">Последние 24 часа</option>
              <option value="week">Последняя неделя</option>
              <option value="month">Последний месяц</option>
              <option value="year">Последний год</option>
            </select>
          </div>
          
          <div className="eco-filter-group">
            <label htmlFor="device">Устройство:</label>
            <select
              id="device"
              name="device"
              value={selectedDevice}
              onChange={handleFilterChange}
              className="eco-select"
            >
              <option value="all">Все устройства</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name || device.id}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Revenue Chart */}
        <div className="eco-chart-container">
          <h2>Динамика выручки</h2>
          {analyticsData.revenue.labels.length > 1 ? (
            <div className="eco-chart">
              <Line 
                data={analyticsData.revenue}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${context.raw.toFixed(0)} тенге`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return `${value.toFixed(0)} ₸`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="eco-empty-state">
              <p>Недостаточно данных для построения графика</p>
            </div>
          )}
        </div>
        
        {/* Operations Chart */}
        <div className="eco-chart-container">
          <h2>Количество операций</h2>
          {analyticsData.operations.labels.length > 1 ? (
            <div className="eco-chart">
              <Line 
                data={analyticsData.operations}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="eco-empty-state">
              <p>Недостаточно данных для построения графика</p>
            </div>
          )}
        </div>
        
        {/* Two-column charts */}
        <div className="eco-charts-row">
          {/* Popular Chemicals Chart */}
          <div className="eco-chart-container half">
            <h2>Популярные химикаты</h2>
            {analyticsData.popularChemicals.labels.length > 0 ? (
              <div className="eco-chart">
                <Pie 
                  data={analyticsData.popularChemicals}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      title: {
                        display: false,
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="eco-empty-state">
                <p>Недостаточно данных для построения графика</p>
              </div>
            )}
          </div>
          
          {/* Device Usage Chart */}
          <div className="eco-chart-container half">
            <h2>Использование устройств</h2>
            {analyticsData.deviceUsage.labels.length > 0 ? (
              <div className="eco-chart">
                <Bar 
                  data={analyticsData.deviceUsage}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: false,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="eco-empty-state">
                <p>Недостаточно данных для построения графика</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;