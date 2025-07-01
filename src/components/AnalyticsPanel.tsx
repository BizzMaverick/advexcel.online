import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Target, AlertTriangle, Info, X } from 'lucide-react';
import { DataAnalytics, ChartConfig } from '../types/analytics';
import { DataAnalyticsEngine } from '../utils/dataAnalytics';
import { SpreadsheetData } from '../types/spreadsheet';
import { NaturalLanguageProcessor } from '../utils/naturalLanguageProcessor';

interface AnalyticsPanelProps {
  data: SpreadsheetData;
  isVisible: boolean;
  onClose: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ data, isVisible, onClose }) => {
  const [analytics, setAnalytics] = useState<DataAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'trends' | 'correlations' | 'outliers' | 'charts' | 'nlp'>('summary');
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [nlpQuery, setNlpQuery] = useState('');
  const [nlpResults, setNlpResults] = useState<any[] | null>(null);
  const [nlpMessage, setNlpMessage] = useState('');

  useEffect(() => {
    if (isVisible && Object.keys(data.cells).length > 0) {
      generateAnalytics();
    }
  }, [isVisible, data.cells]);

  const generateAnalytics = async () => {
    setLoading(true);
    try {
      const engine = new DataAnalyticsEngine(data.cells);
      const analyticsData = engine.generateAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error generating analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChart = (type: ChartConfig['type'], xAxis: string, yAxis: string) => {
    try {
      const engine = new DataAnalyticsEngine(data.cells);
      const config = engine.generateChart({ type, xAxis, yAxis });
      setChartConfig(config);
      setActiveTab('charts');
    } catch (error) {
      console.error('Error generating chart:', error);
    }
  };

  const handleNlpQuery = () => {
    if (!nlpQuery.trim()) return;
    
    try {
      const processor = new NaturalLanguageProcessor(data.cells);
      const result = processor.processQuery(nlpQuery);
      
      if (result.success) {
        setNlpResults(result.data);
        setNlpMessage(result.message);
      } else {
        setNlpResults([]);
        setNlpMessage(result.message);
      }
    } catch (error) {
      console.error('Error processing NLP query:', error);
      setNlpResults([]);
      setNlpMessage('Error processing your query. Please try again.');
    }
  };

  const renderChart = () => {
    if (!chartConfig) return null;

    const { type, data: chartData, xAxis, yAxis, colors } = chartConfig;

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxis} fill={colors?.[0] || '#2563EB'} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yAxis} stroke={colors?.[0] || '#2563EB'} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey={yAxis}
                nameKey={xAxis}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors?.[index % (colors?.length || 1)] || `hsl(${index * 45 % 360}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis dataKey={yAxis} />
              <Tooltip />
              <Scatter fill={colors?.[0] || '#2563EB'} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="text-center text-gray-500">Chart type not supported</div>;
    }
  };

  const renderNlpResults = () => {
    if (!nlpResults) return null;
    if (nlpResults.length === 0) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          No results found for your query.
        </div>
      );
    }

    // Check if this is a single-row result (like an aggregation)
    if (nlpResults.length === 1 && Object.keys(nlpResults[0]).some(key => key.includes('sum_') || key.includes('avg_'))) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-3">Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(nlpResults[0]).map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">{key}</div>
                <div className="text-lg font-semibold text-blue-900">
                  {typeof value === 'number' ? value.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  }) : String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // For regular result sets
    if (nlpResults.length > 0) {
      const columns = Object.keys(nlpResults[0]);
      
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nlpResults.slice(0, 100).map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {typeof row[column] === 'number' 
                        ? row[column].toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                        : String(row[column] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {nlpResults.length > 100 && (
            <div className="text-center py-2 text-sm text-gray-500">
              Showing first 100 of {nlpResults.length} results
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Data Analytics Dashboard</h2>
              <p className="text-sm text-gray-600 hidden sm:block">Comprehensive data analysis and insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4 lg:px-6 overflow-x-auto flex-shrink-0">
          {[
            { id: 'summary', label: 'Summary', icon: Info },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'correlations', label: 'Correlations', icon: Target },
            { id: 'outliers', label: 'Outliers', icon: AlertTriangle },
            { id: 'charts', label: 'Charts', icon: BarChart3 },
            { id: 'nlp', label: 'Natural Language', icon: Activity },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`
                flex items-center space-x-2 px-3 lg:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : analytics ? (
            <>
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800">Total Rows</h3>
                      <p className="text-2xl font-bold text-blue-900">{analytics.summary.totalRows}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-green-800">Total Columns</h3>
                      <p className="text-2xl font-bold text-green-900">{analytics.summary.totalColumns}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-orange-800">Numeric Columns</h3>
                      <p className="text-2xl font-bold text-orange-900">{analytics.summary.numericColumns.length}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-purple-800">Text Columns</h3>
                      <p className="text-2xl font-bold text-purple-900">{analytics.summary.textColumns.length}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Column Types</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Numeric:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analytics.summary.numericColumns.map(col => (
                              <span key={col} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{col}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Text:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analytics.summary.textColumns.map(col => (
                              <span key={col} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">{col}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Quality</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(analytics.summary.missingValues).map(([col, missing]) => (
                          <div key={col} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 truncate">{col}</span>
                            <span className={`text-sm font-medium ${missing > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {missing > 0 ? `${missing} missing` : 'Complete'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {analytics.trends.map((trend, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{trend.column}</h3>
                          <span className={`
                            px-2 py-1 text-xs font-medium rounded-full
                            ${trend.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                              trend.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                              trend.trend === 'stable' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'}
                          `}>
                            {trend.trend}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Slope:</span>
                            <span className="font-medium">{trend.slope.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>R-squared:</span>
                            <span className="font-medium">{trend.rSquared.toFixed(4)}</span>
                          </div>
                          <div>
                            <span>5-period forecast:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {trend.forecast.map((val, i) => (
                                <span key={i} className="px-1 py-0.5 bg-gray-100 text-xs rounded">
                                  {val.toFixed(2)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'correlations' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Correlation Matrix</h3>
                    <div className="overflow-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left text-sm font-medium text-gray-600 p-2"></th>
                            {analytics.correlations.columns.map(col => (
                              <th key={col} className="text-center text-sm font-medium text-gray-600 p-2 min-w-[80px]">
                                <div className="truncate" title={col}>{col}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.correlations.matrix.map((row, i) => (
                            <tr key={i}>
                              <td className="text-sm font-medium text-gray-900 p-2">
                                <div className="truncate" title={analytics.correlations.columns[i]}>
                                  {analytics.correlations.columns[i]}
                                </div>
                              </td>
                              {row.map((corr, j) => (
                                <td key={j} className="text-center p-2">
                                  <span className={`
                                    px-2 py-1 text-xs font-medium rounded
                                    ${Math.abs(corr) > 0.7 ? 'bg-red-100 text-red-800' :
                                      Math.abs(corr) > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'}
                                  `}>
                                    {corr.toFixed(3)}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'outliers' && (
                <div className="space-y-6">
                  {analytics.outliers.map((outlierData, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{outlierData.column}</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {outlierData.outliers.slice(0, 10).map((outlier, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-red-50 rounded">
                            <span className="text-sm text-gray-600">Row {outlier.row}</span>
                            <span className="text-sm font-medium text-gray-900">{outlier.value}</span>
                            <span className="text-sm text-red-600">Z-score: {outlier.zScore.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'charts' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Chart</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                      {analytics.summary.numericColumns.length > 0 && (
                        <>
                          <button
                            onClick={() => generateChart('bar', analytics.summary.numericColumns[0], analytics.summary.numericColumns[1] || analytics.summary.numericColumns[0])}
                            className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            <span>Bar Chart</span>
                          </button>
                          <button
                            onClick={() => generateChart('line', analytics.summary.numericColumns[0], analytics.summary.numericColumns[1] || analytics.summary.numericColumns[0])}
                            className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <span>Line Chart</span>
                          </button>
                          <button
                            onClick={() => generateChart('pie', analytics.summary.numericColumns[0], analytics.summary.numericColumns[1] || analytics.summary.numericColumns[0])}
                            className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <PieIcon className="h-5 w-5 text-orange-600" />
                            <span>Pie Chart</span>
                          </button>
                          <button
                            onClick={() => generateChart('scatter', analytics.summary.numericColumns[0], analytics.summary.numericColumns[1] || analytics.summary.numericColumns[0])}
                            className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <Activity className="h-5 w-5 text-purple-600" />
                            <span>Scatter Plot</span>
                          </button>
                        </>
                      )}
                    </div>
                    {chartConfig && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-md font-medium text-gray-900 mb-3">{chartConfig.title}</h4>
                        {renderChart()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'nlp' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Natural Language Query</h3>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Ask questions about your data in plain English. For example:
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[
                          "Show sales by region",
                          "Find top 5 products by revenue",
                          "What's the average salary?",
                          "Compare north vs south region",
                          "Show data for January 2024"
                        ].map((example, i) => (
                          <button
                            key={i}
                            onClick={() => setNlpQuery(example)}
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={nlpQuery}
                          onChange={(e) => setNlpQuery(e.target.value)}
                          placeholder="Ask a question about your data..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={handleNlpQuery}
                          disabled={!nlpQuery.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Ask
                        </button>
                      </div>
                    </div>

                    {nlpMessage && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">{nlpMessage}</p>
                      </div>
                    )}

                    {renderNlpResults()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No data available for analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};