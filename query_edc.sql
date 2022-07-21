-- total closed tiket seminggu terakhir
SELECT COUNT(1) AS total_close_tiket, 
COUNT(
    CASE WHEN update_ticket - entry_ticket <= target_hari THEN 1 ELSE null END) AS target_in, 
ROUND(
    COUNT(
        CASE WHEN update_ticket - entry_ticket <= target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2) AS rate_target 
FROM tiket_edc 
WHERE update_ticket BETWEEN CURRENT_DATE-6 AND CURRENT_DATE;

-- Performa Pemasang (tiket_edc)
SELECT pemasang, COUNT(1) AS tiket_close,
COUNT(CASE WHEN update_ticket - entry_ticket <= target_hari THEN 1 ELSE null END) AS target_in,
COUNT(CASE WHEN update_ticket - entry_ticket > target_hari THEN 1 ELSE null END) AS target_out,
ROUND(
    COUNT(CASE WHEN update_ticket - entry_ticket <= target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2) 
    AS rate_target
FROM tiket_edc
GROUP BY pemasang ORDER BY tiket_close DESC;

-- List per jenis tiket (edc)
SELECT jenis_masalah, COUNT(1) AS tiket_close,
COUNT(CASE WHEN update_ticket - entry_ticket <= target_hari THEN 1 ELSE null END) AS target_in,
COUNT(CASE WHEN update_ticket - entry_ticket > target_hari THEN 1 ELSE null END) AS target_out,
ROUND(
    COUNT(CASE WHEN update_ticket - entry_ticket <= target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2) 
    AS rate_target
FROM tiket_edc
GROUP BY jenis_masalah ORDER BY tiket_close DESC;

-- Rate tiket dalam seminggu terakhir
SELECT update_ticket, COUNT(1) AS tiket_close,
COUNT(CASE WHEN update_ticket - entry_ticket <= target_hari THEN 1 ELSE null END) AS target_in,
COUNT(CASE WHEN update_ticket - entry_ticket > target_hari THEN 1 ELSE null END) AS target_out,
ROUND(
    COUNT(CASE WHEN update_ticket - entry_ticket <= target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2) 
    AS rate_target
FROM tiket_edc
WHERE update_ticket BETWEEN CURRENT_DATE-6 AND CURRENT_DATE
GROUP BY update_ticket ORDER BY update_ticket DESC;