// src/pages/management/RevenueStatistics.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker, Radio, Table, Statistic, Row, Col, Spin, Alert, Pagination, Empty, Typography } from 'antd';
// 1. Import Line chart
import { Line } from '@ant-design/charts'; 
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);
dayjs.locale('vi');

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const RevenueStatistics = () => {
  // State cho Bảng (Table)
  const [tableData, setTableData] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0 });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalInvoices: 0 });
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState(null);
  
  // State cho Biểu đồ (Chart)
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);

  // State chung cho bộ lọc
  const [filterType, setFilterType] = useState('this_week'); // Đổi mặc định thành 'tuần này'
  const [dateRange, setDateRange] = useState([dayjs().startOf('week'), dayjs().endOf('week')]);
  const [currentPage, setCurrentPage] = useState(1);

  // Tính toán dateRange dựa trên filterType
  const calculateDateRange = (type) => {
    switch (type) {
      case 'today':
        return [dayjs().startOf('day'), dayjs().endOf('day')];
      case 'this_week':
        return [dayjs().startOf('week'), dayjs().endOf('week')];
      case 'this_month':
        return [dayjs().startOf('month'), dayjs().endOf('month')];
      case 'this_year':
        return [dayjs().startOf('year'), dayjs().endOf('year')];
      case 'custom':
        return dateRange;
      default:
        return [dayjs().startOf('week'), dayjs().endOf('week')];
    }
  };

  // Hàm gọi API cho Bảng
  const fetchTableData = useCallback(async (page, startDate, endDate) => {
    setTableLoading(true);
    setTableError(null);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const start = startDate.format('YYYY-MM-DD');
      const end = endDate.format('YYYY-MM-DD');

      const response = await fetch(
        `${API_BASE_URL}/management/revenue/statistics?page=${page}&limit=10&startDate=${start}&endDate=${end}`, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      setTableData(result.data || []);
      setSummary(result.summary || { totalRevenue: 0 });
      setPagination(result.pagination || { currentPage: 1, totalPages: 1, totalInvoices: 0 });
    } catch (err) {
      setTableError(err.message);
      setTableData([]);
      setSummary({ totalRevenue: 0 });
    } finally {
      setTableLoading(false);
    }
  }, []); // useCallback

  // 2. Hàm gọi API cho Biểu đồ
  const fetchChartData = useCallback(async (startDate, endDate) => {
    setChartLoading(true);
    setChartError(null);
    
    // Tự động quyết định nhóm theo ngày/tháng
    let groupBy = 'day';
    if (filterType === 'this_year') {
      groupBy = 'month';
    } else if (filterType === 'custom') {
      const diffDays = endDate.diff(startDate, 'day');
      if (diffDays > 90) groupBy = 'month'; // Tự động nhóm theo tháng nếu > 3 tháng
    }

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const start = startDate.format('YYYY-MM-DD');
      const end = endDate.format('YYYY-MM-DD');

      const response = await fetch(
        `${API_BASE_URL}/management/revenue/chart?startDate=${start}&endDate=${end}&groupBy=${groupBy}`, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      
      setChartData(result.data || []);
    } catch (err) {
      setChartError(err.message);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [filterType]); // Phụ thuộc vào filterType để quyết định groupBy

  // Fetch data khi bộ lọc hoặc trang thay đổi
  useEffect(() => {
    const [start, end] = calculateDateRange(filterType);
    
    // Gọi cả 2 API
    fetchTableData(currentPage, start, end);
    fetchChartData(start, end);

  }, [filterType, dateRange, currentPage, fetchTableData, fetchChartData]);

  // Event Handlers
  const handleFilterTypeChange = (e) => {
    const newType = e.target.value;
    setFilterType(newType);
    setCurrentPage(1); // Reset về trang 1
    if (newType !== 'custom') {
      setDateRange(calculateDateRange(newType));
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Cấu hình cột cho bảng (giữ nguyên)
  const columns = [
    { title: 'Mã HĐ', dataIndex: 'invoiceId', key: 'invoiceId', width: 120 },
    { title: 'Bệnh nhân', dataIndex: ['patient', 'basicInfo', 'fullName'], key: 'patient', render: (name) => name || <Text type="secondary">N/A</Text> },
    { title: 'Lễ tân', dataIndex: ['staff', 'user', 'fullName'], key: 'staff', render: (name) => name || <Text type="secondary">N/A</Text> },
    { title: 'Ngày thanh toán', dataIndex: 'invoiceDate', key: 'invoiceDate', render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'), width: 160 },
    { title: 'Thành tiền (VND)', dataIndex: 'finalAmount', key: 'finalAmount', align: 'right', render: (val) => <Text strong>{(val || 0).toLocaleString('vi-VN')}</Text>, width: 150 },
    { title: 'Phương thức', dataIndex: 'paymentMethod', key: 'paymentMethod', width: 120 }
  ];

  // 3. Cấu hình cho Biểu đồ
  const chartConfig = {
    data: chartData,
    xField: 'date',
    yField: 'revenue',
    height: 300,
    xAxis: {
      title: { text: 'Thời gian' },
      label: {
        autoHide: true,
        autoRotate: true,
      },
    },
    yAxis: {
      title: { text: 'Doanh thu (VND)' },
      label: {
        formatter: (v) => `${(v / 1000000).toLocaleString('vi-VN')} Tr`, // Hiển thị triệu
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: 'Doanh thu',
        value: `${datum.revenue.toLocaleString('vi-VN')} VND`,
      }),
    },
    point: {
      size: 4,
      shape: 'circle',
    },
    lineStyle: {
      lineWidth: 2,
    },
    smooth: true,
  };

  return (
    <div className="content-card">
      <Title level={2}>Thống kê Doanh thu</Title>
      
      {/* Bộ lọc (giữ nguyên) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Radio.Group value={filterType} onChange={handleFilterTypeChange}>
            <Radio.Button value="today">Hôm nay</Radio.Button>
            <Radio.Button value="this_week">Tuần này</Radio.Button>
            <Radio.Button value="this_month">Tháng này</Radio.Button>
            <Radio.Button value="this_year">Năm này</Radio.Button>
            <Radio.Button value="custom">Tùy chọn</Radio.Button>
          </Radio.Group>
        </Col>
        <Col xs={24} md={12}>
          {filterType === 'custom' && (
            <RangePicker 
              value={dateRange} 
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          )}
        </Col>
      </Row>

      {/* Thống kê tổng quan (giữ nguyên) */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Statistic 
            title="Tổng Doanh Thu (VND)" 
            value={summary.totalRevenue} 
            precision={0}
            loading={tableLoading} // Dùng loading của table
            valueStyle={{ color: '#3f8600' }}
            formatter={(value) => `${value.toLocaleString('vi-VN')}`}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="Tổng số Hóa đơn" 
            value={pagination.totalInvoices} 
            loading={tableLoading} // Dùng loading của table
          />
        </Col>
      </Row>

      {/* 4. Thêm Biểu đồ vào đây */}
      <Title level={4} style={{ marginTop: '24px' }}>Biểu đồ Doanh thu</Title>
      <Spin spinning={chartLoading}>
        {chartError && <Alert message="Lỗi tải dữ liệu biểu đồ" description={chartError} type="error" showIcon style={{ marginBottom: 16 }} />}
        {chartData.length > 0 ? (
          <Line {...chartConfig} />
        ) : (
          !chartLoading && <Empty description="Không có dữ liệu biểu đồ" />
        )}
      </Spin>

      {/* Bảng dữ liệu (giữ nguyên, đổi tên state) */}
      <Title level={4} style={{ marginTop: '32px' }}>Chi tiết Hóa đơn</Title>
      <Spin spinning={tableLoading}>
        {tableError && <Alert message="Lỗi tải dữ liệu bảng" description={tableError} type="error" showIcon style={{ marginBottom: 16 }} />}
        
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="_id"
          pagination={false}
          locale={{ emptyText: <Empty description="Không có dữ liệu doanh thu" /> }}
        />
        
        <Pagination
          current={currentPage}
          pageSize={10}
          total={pagination.totalInvoices}
          onChange={handlePageChange}
          style={{ marginTop: 24, textAlign: 'right' }}
          disabled={tableLoading}
          showSizeChanger={false}
        />
      </Spin>
    </div>
  );
}

export default RevenueStatistics;