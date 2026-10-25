delete from cd_terms;

insert into cd_terms (id, apy, months, featured, sort_order) values
  ('cd_10', '4.40%', 10, true, 0),
  ('cd_11', '3.65%', 11, false, 1),
  ('cd_12', '3.65%', 12, false, 2),
  ('cd_14', '3.65%', 14, false, 3),
  ('cd_18', '3.65%', 18, false, 4),
  ('cd_22', '4.40%', 22, false, 5),
  ('cd_24', '3.65%', 24, false, 6),
  ('cd_36', '2.25%', 36, false, 7),
  ('cd_48', '2.25%', 48, false, 8),
  ('cd_60', '3.00%', 60, false, 9);
