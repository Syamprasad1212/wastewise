-- Seed Data for WasteWise
INSERT INTO public.waste_schedules (ward_number, ward_name, ward_name_te, day_of_week, day_of_week_te, collection_time, waste_types, worker_name, vehicle_number)
VALUES
  ('Ward 1', 'Bazaar Area', 'బజార్ ప్రాంతం', 'Daily (Mon - Sat)', 'ప్రతిరోజు (సోమ - శని)', '06:30 AM - 08:30 AM', ARRAY['wet'], 'Mallesh (మల్లేష్)', 'AP-26-TG-1044'),
  ('Ward 1', 'Bazaar Area', 'బజార్ ప్రాంతం', 'Wednesday & Saturday', 'బుధవారం & శనివారం', '02:00 PM - 04:30 PM', ARRAY['dry'], 'Mallesh (మల్లేష్)', 'AP-26-TG-1044'),
  ('Ward 2', 'Temple Street', 'గుడి వీధి ప్రాంతం', 'Daily (Mon - Sat)', 'ప్రతిరోజు (సోమ - శని)', '07:00 AM - 09:00 AM', ARRAY['wet'], 'Koteswara Rao (కోటేశ్వరరావు)', 'AP-26-TG-1048'),
  ('Ward 3', 'ZPH School & Colony', 'పాఠశాల & కాలనీ', 'Tuesday & Friday', 'మంగళవారం & శుక్రవారం', '08:30 AM - 10:30 AM', ARRAY['dry'], 'Suresh Kumar (సురేష్)', 'AP-26-TG-1050');

INSERT INTO public.households (house_number, head_of_household, family_members_count, ward_number, street_name, phone_number, qr_code_id)
VALUES
  ('2-14/A', 'Ramesh Reddy', 5, 'Ward 1', 'Bazaar Street / బజార్ వీధి', '9848022331', 'QR-W1-001'),
  ('3-55/B', 'Lakshmi Devi', 4, 'Ward 2', 'Temple Road / గుడి వీధి', '9848033442', 'QR-W2-014'),
  ('1-88/C', 'Venkat Rao', 6, 'Ward 3', 'School Street / బడి వీధి', '9848044553', 'QR-W3-022');
