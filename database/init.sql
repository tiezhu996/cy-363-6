CREATE TABLE IF NOT EXISTS operation_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_name VARCHAR(120) NOT NULL,
  owner_name VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  metric VARCHAR(40) NOT NULL,
  priority VARCHAR(20) DEFAULT '中',
  deadline DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO operation_records (module_name, owner_name, status, metric, priority, deadline)
VALUES 
  ('主题房间与难度分级', '运营组', '已上线', '88%', '高', '2026-06-30'),
  ('场次预约与拼团', '管理员', '排期中', '31 单', '中', '2026-06-15'),
  ('线索道具库存管理', '服务台', '巡检中', '10 项', '低', '2026-06-20'),
  ('玩家通关时长排行榜', '财务组', '优化中', '4 级', '高', '2026-06-05'),
  ('营收与上座率分析', '审核组', '可导出', '28 条', '中', '2026-06-25');
