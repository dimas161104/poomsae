-- ============================================================
-- POOMSAE ONLINE v2 - SEED DATA
-- ============================================================

-- 1. Tournament Settings
INSERT INTO tournament_settings (id, name, arena_count, arena_format, judges_per_session, has_backup_judge, forms_count, location, start_date, end_date, organizer) VALUES
  ('a0000000-0000-0000-0000-000000000001',
   'Kejuaraan Nasional Taekwondo Poomsae 2025',
   3, 'huruf', 5, true, 2,
   'GOR Cakrawala Ciracas, Jakarta Timur',
   '2025-10-18', '2025-10-20',
   'Federasi Taekwondo Indonesia (PBTI)');

-- 2. Arenas (3 arenas, format huruf)
INSERT INTO arenas (id, name, code, display_name) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Lapangan A', 'A', 'Lapangan A'),
  ('b0000000-0000-0000-0000-000000000002', 'Lapangan B', 'B', 'Lapangan B'),
  ('b0000000-0000-0000-0000-000000000003', 'Lapangan C', 'C', 'Lapangan C');

-- 3. Users (Master User)
INSERT INTO users (id, name, email, username, role, status) VALUES
  ('u0000000-0000-0000-0000-000000000001', 'Admin PBTI', 'admin@pbti-poomsae.id', 'admin', 'admin', 'active'),
  ('u0000000-0000-0000-0000-000000000002', 'Operator Lapangan A', NULL, 'operator_a', 'operator', 'active'),
  ('u0000000-0000-0000-0000-000000000003', 'Operator Lapangan B', NULL, 'operator_b', 'operator', 'active'),
  ('u0000000-0000-0000-0000-000000000004', 'Media Proyektor 1', NULL, 'media_1', 'media', 'active'),
  ('u0000000-0000-0000-0000-000000000005', 'Media Proyektor 2', NULL, 'media_2', 'media', 'active');

-- 4. Judges (Master Juri - 6 = 5 aktif + 1 cadangan)
INSERT INTO judges (id, name, judge_code, pin, rank, organization, status, is_online) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Master Bambang Suryanto', 'J-001', '142536', 'Wasit Nasional Utama', 'PBTI Pusat', 'active', true),
  ('e0000000-0000-0000-0000-000000000002', 'Sabeum Liem Wen', 'J-002', '253647', 'Wasit Nasional Madya', 'Pengprov DKI', 'active', true),
  ('e0000000-0000-0000-0000-000000000003', 'Master Eko Prasetyo', 'J-003', '364758', 'Wasit Nasional Madya', 'Pengprov DKI', 'active', true),
  ('e0000000-0000-0000-0000-000000000004', 'Sabeum Nuraini Dewi', 'J-004', '475869', 'Wasit Nasional Muda', 'Pengcab Jabar', 'active', true),
  ('e0000000-0000-0000-0000-000000000005', 'Sabeumnim Hendra Cahyadi', 'J-005', '586970', 'Wasit Nasional Madya', 'Pengprov Jateng', 'active', true),
  ('e0000000-0000-0000-0000-000000000006', 'Master Rizki Pratama', 'J-006', '697081', 'Wasit Nasional Muda', 'Pengprov Jatim', 'active', true);

-- 5. Categories
INSERT INTO categories (id, name, type, age_group, gender, description) VALUES
  ('cat00000-0000-0000-0000-000000000001', 'Senior Putra Individual Prestasi', 'prestasi', 'Senior', 'Putra', 'Kategori utama putra tingkat senior'),
  ('cat00000-0000-0000-0000-000000000002', 'Senior Putri Individual Prestasi', 'prestasi', 'Senior', 'Putri', 'Kategori utama putri tingkat senior'),
  ('cat00000-0000-0000-0000-000000000003', 'Junior Putra Pemula', 'pemula', 'Junior', 'Putra', 'Kategori pemula putra junior'),
  ('cat00000-0000-0000-0000-000000000004', 'Junior Putri Pemula', 'pemula', 'Junior', 'Putri', 'Kategori pemula putri junior'),
  ('cat00000-0000-0000-0000-000000000005', 'Speed Kicking Putra', 'speed_kick', 'Senior', 'Putra', 'Lomba tendangan cepat putra'),
  ('cat00000-0000-0000-0000-000000000006', 'Kadet Putra Individual Prestasi', 'prestasi', 'Kadet', 'Putra', 'Kategori prestasi kadet putra');

-- 6. Poomsae Forms
INSERT INTO poomsae_forms (id, name, korean_name, number, level) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Taegeuk 1 Jang', '태극 1장', 1, 'Taegeuk'),
  ('d0000000-0000-0000-0000-000000000002', 'Taegeuk 2 Jang', '태극 2장', 2, 'Taegeuk'),
  ('d0000000-0000-0000-0000-000000000003', 'Taegeuk 3 Jang', '태극 3장', 3, 'Taegeuk'),
  ('d0000000-0000-0000-0000-000000000004', 'Taegeuk 4 Jang', '태극 4장', 4, 'Taegeuk'),
  ('d0000000-0000-0000-0000-000000000005', 'Taegeuk 5 Jang', '태극 5장', 5, 'Taegeuk'),
  ('d0000000-0000-0000-0000-000000000006', 'Taegeuk 6 Jang', '태극 6장', 6, 'Taegeuk'),
  ('d0000000-0000-0000-0000-000000000007', 'Taegeuk 7 Jang', '태극 7장', 7, 'Taegeuk'),
  ('d0000000-0000-0000-0000-000000000008', 'Taegeuk 8 Jang', '태극 8장', 8, 'Taegeuk'),
  ('d0000000-0000-0000-0000-000000000009', 'Koryo', '고려', 9, 'Black Belt'),
  ('d0000000-0000-0000-0000-000000000010', 'Keumgang', '금강', 10, 'Black Belt'),
  ('d0000000-0000-0000-0000-000000000011', 'Taebaek', '태백', 11, 'Black Belt'),
  ('d0000000-0000-0000-0000-000000000012', 'Pyongwon', '평원', 12, 'Black Belt'),
  ('d0000000-0000-0000-0000-000000000013', 'Sipjin', '십진', 13, 'Black Belt');

-- 7. Athletes - Prestasi (10 for Senior Putra - will test >8 bracket)
INSERT INTO athletes (id, name, initials, category_id, type, contingent, province, gender, dan_level, youtube_url, verification_status) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Ahmad Zaki Kurniawan', 'AZK', 'cat00000-0000-0000-0000-000000000001', 'prestasi', 'Pengprov DKI Jakarta', 'DKI Jakarta', 'Putra', 'Dan III', 'https://youtube.com/watch?v=example1', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000002', 'Rayhan Bagus Pratama', 'RBP', 'cat00000-0000-0000-0000-000000000001', 'prestasi', 'Pengcab Jawa Barat', 'Jawa Barat', 'Putra', 'Dan II', 'https://youtube.com/watch?v=example2', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000003', 'Muhammad Dimas Satria', 'MDS', 'cat00000-0000-0000-0000-000000000001', 'prestasi', 'Pengprov Jawa Tengah', 'Jawa Tengah', 'Putra', 'Dan II', 'https://youtube.com/watch?v=example3', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000004', 'Kevin Pratama Yudha', 'KPY', 'cat00000-0000-0000-0000-000000000001', 'prestasi', 'Pengprov DI Yogyakarta', 'DI Yogyakarta', 'Putra', 'Dan III', 'https://youtube.com/watch?v=example4', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000005', 'Fajar Nugroho', 'FN', 'cat00000-0000-0000-0000-000000000001', 'prestasi', 'Pengprov Banten', 'Banten', 'Putra', 'Dan II', 'https://youtube.com/watch?v=example5', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000006', 'Fadhl Pratama', 'FP', 'cat00000-0000-0000-0000-000000000001', 'prestasi', 'Pengprov DKI Jakarta', 'DKI Jakarta', 'Putra', 'Dan II', 'https://youtube.com/watch?v=example6', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000007', 'Budi Santoso', 'BS', 'cat00000-0000-0000-0000-000000000001', 'prestasi', 'Pengprov Jawa Timur', 'Jawa Timur', 'Putra', 'Dan III', 'https://youtube.com/watch?v=example7', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000008', 'Rizky Aditya', 'RA', 'cat00000-0000-0000-0000-000000000001', 'prestasi', 'Pengprov Bali', 'Bali', 'Putra', 'Dan II', 'https://youtube.com/watch?v=example8', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000009', 'Hendra Wijaya', 'HW', 'cat00000-0000-0000-0000-000000000001', 'prestasi', 'Pengprov Sumatera Utara', 'Sumut', 'Putra', 'Dan II', 'https://youtube.com/watch?v=example9', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000010', 'Andi Firmansyah', 'AF', 'cat00000-0000-0000-0000-000000000001', 'prestasi', 'Pengprov Sulawesi Selatan', 'Sulsel', 'Putra', 'Dan III', 'https://youtube.com/watch?v=example10', 'terverifikasi');

-- Athletes - Pemula (6 for Junior Putra - 2 groups of 3)
INSERT INTO athletes (id, name, initials, category_id, type, contingent, province, gender, dan_level, youtube_url, verification_status) VALUES
  ('f0000000-0000-0000-0000-000000000011', 'Rian Faturrahman', 'RF', 'cat00000-0000-0000-0000-000000000003', 'pemula', 'Pengprov Jawa Timur', 'Jawa Timur', 'Putra', 'Dan I', 'https://youtube.com/watch?v=ex11', 'menunggu'),
  ('f0000000-0000-0000-0000-000000000012', 'Arif Setiawan', 'AS', 'cat00000-0000-0000-0000-000000000003', 'pemula', 'Pengprov DKI Jakarta', 'DKI Jakarta', 'Putra', 'Geup', 'https://youtube.com/watch?v=ex12', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000013', 'Dani Prasetyo', 'DP', 'cat00000-0000-0000-0000-000000000003', 'pemula', 'Pengprov Banten', 'Banten', 'Putra', 'Geup', 'https://youtube.com/watch?v=ex13', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000014', 'Gilang Ramadhan', 'GR', 'cat00000-0000-0000-0000-000000000003', 'pemula', 'Pengprov Jabar', 'Jawa Barat', 'Putra', 'Dan I', 'https://youtube.com/watch?v=ex14', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000015', 'Taufik Hidayat', 'TH', 'cat00000-0000-0000-0000-000000000003', 'pemula', 'Pengprov Jateng', 'Jawa Tengah', 'Putra', 'Geup', 'https://youtube.com/watch?v=ex15', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000016', 'Yoga Pratama', 'YP', 'cat00000-0000-0000-0000-000000000003', 'pemula', 'Pengprov DIY', 'DI Yogyakarta', 'Putra', 'Geup', 'https://youtube.com/watch?v=ex16', 'terverifikasi');

-- Athletes - Speed Kick (3 for Speed Kicking Putra)
INSERT INTO athletes (id, name, initials, category_id, type, contingent, province, gender, verification_status) VALUES
  ('f0000000-0000-0000-0000-000000000017', 'Wahyu Setiabudi', 'WS', 'cat00000-0000-0000-0000-000000000005', 'speed_kick', 'Pengprov DKI Jakarta', 'DKI Jakarta', 'Putra', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000018', 'Reza Firmansyah', 'RF2', 'cat00000-0000-0000-0000-000000000005', 'speed_kick', 'Pengprov Jatim', 'Jawa Timur', 'Putra', 'terverifikasi'),
  ('f0000000-0000-0000-0000-000000000019', 'Agus Hermawan', 'AH', 'cat00000-0000-0000-0000-000000000005', 'speed_kick', 'Pengprov Bali', 'Bali', 'Putra', 'terverifikasi');

-- 8. Brackets
-- Prestasi Senior Putra: 10 athletes > 8, so penyisihan first
INSERT INTO brackets (id, category_id, type, round, cutoff_count, status) VALUES
  ('br000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000001', 'eliminasi', 'penyisihan', 8, 'active');

-- Pemula Junior Putra: 2 groups of 3
INSERT INTO brackets (id, category_id, type, round, group_name, group_size, status) VALUES
  ('br000000-0000-0000-0000-000000000002', 'cat00000-0000-0000-0000-000000000003', 'grup', 'final', 'Grup A', 3, 'active'),
  ('br000000-0000-0000-0000-000000000003', 'cat00000-0000-0000-0000-000000000003', 'grup', 'final', 'Grup B', 3, 'active');

-- 9. Bracket Athletes
-- Prestasi: all 10 in penyisihan
INSERT INTO bracket_athletes (bracket_id, athlete_id, seed_order) VALUES
  ('br000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 1),
  ('br000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 2),
  ('br000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003', 3),
  ('br000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000004', 4),
  ('br000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', 5),
  ('br000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000006', 6),
  ('br000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000007', 7),
  ('br000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000008', 8),
  ('br000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000009', 9),
  ('br000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000010', 10);

-- Pemula: Grup A
INSERT INTO bracket_athletes (bracket_id, athlete_id, seed_order) VALUES
  ('br000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000011', 1),
  ('br000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000012', 2),
  ('br000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000013', 3);
-- Pemula: Grup B
INSERT INTO bracket_athletes (bracket_id, athlete_id, seed_order) VALUES
  ('br000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000014', 1),
  ('br000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000015', 2),
  ('br000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000016', 3);

-- 10. Schedules
INSERT INTO schedules (id, bracket_id, arena_id, match_date, start_time, session_name, status) VALUES
  ('sc000000-0000-0000-0000-000000000001', 'br000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2025-10-18', '09:00', 'Sesi 1 - Penyisihan Senior Putra', 'berlangsung'),
  ('sc000000-0000-0000-0000-000000000002', 'br000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', '2025-10-18', '09:00', 'Sesi 1 - Pemula Junior Putra Grup A', 'dijadwalkan'),
  ('sc000000-0000-0000-0000-000000000003', 'br000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', '2025-10-18', '11:00', 'Sesi 2 - Pemula Junior Putra Grup B', 'dijadwalkan');

-- 11. Judge Assignments (for schedule 1)
INSERT INTO judge_assignments (id, schedule_id, judge_id, arena_id, position, is_backup) VALUES
  ('ja000000-0000-0000-0000-000000000001', 'sc000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'J1', false),
  ('ja000000-0000-0000-0000-000000000002', 'sc000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'J2', false),
  ('ja000000-0000-0000-0000-000000000003', 'sc000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'J3', false),
  ('ja000000-0000-0000-0000-000000000004', 'sc000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'J4', false),
  ('ja000000-0000-0000-0000-000000000005', 'sc000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'J5', false),
  ('ja000000-0000-0000-0000-000000000006', 'sc000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'cadangan', true);

-- 12. Matches (generated from schedule 1 - first 3 athletes for penyisihan)
INSERT INTO matches (id, schedule_id, bracket_id, arena_id, match_number, athlete_id, poomsae_form_id, form_number, category, round, status, is_current) VALUES
  ('m0000000-0000-0000-0000-000000000001', 'sc000000-0000-0000-0000-000000000001', 'br000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1, 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000009', 1, 'Senior Putra Individual Prestasi', 'penyisihan', 'aktif', true),
  ('m0000000-0000-0000-0000-000000000002', 'sc000000-0000-0000-0000-000000000001', 'br000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 2, 'f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000009', 1, 'Senior Putra Individual Prestasi', 'penyisihan', 'menunggu', false),
  ('m0000000-0000-0000-0000-000000000003', 'sc000000-0000-0000-0000-000000000001', 'br000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 3, 'f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000009', 1, 'Senior Putra Individual Prestasi', 'penyisihan', 'menunggu', false);
