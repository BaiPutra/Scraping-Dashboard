-- total closed tiket seminggu terakhir (atm crm)
SELECT COUNT(1) AS total_close_tiket, 
COUNT(
    CASE WHEN last_update - input_date <= b.target_hari THEN 1 ELSE null END) AS target_in,
ROUND(
    COUNT(
        CASE WHEN last_update - input_date <= b.target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2) 
    	AS rate_target
FROM tiket_atm_crm a
JOIN jenis_tiket b ON a.rtl_problem = b.id
WHERE last_update BETWEEN CURRENT_DATE-6 AND CURRENT_DATE;

-- Performa kantor cabang
SELECT kantor_cabang, COUNT(1) AS tiket_close, 
COUNT(CASE WHEN last_update - input_date <= b.target_hari THEN 1 ELSE null END) AS target_in,
COUNT(CASE WHEN last_update - input_date > b.target_hari THEN 1 ELSE null END) AS target_out,
ROUND(
    COUNT(CASE WHEN last_update - input_date <= b.target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2) 
    AS rate_target
FROM tiket_atm_crm a
JOIN jenis_tiket b ON a.rtl_problem = b.id
GROUP BY kantor_cabang ORDER BY tiket_close DESC;

-- List per jenis tiket (atm crm)
SELECT a.rtl_problem, COUNT(1) AS tiket_close, 
COUNT(CASE WHEN last_update - input_date <= b.target_hari THEN 1 ELSE null END) AS target_in,
COUNT(CASE WHEN last_update - input_date > b.target_hari THEN 1 ELSE null END) AS target_out,
ROUND(
    COUNT(CASE WHEN last_update - input_date <= b.target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2) 
    AS rate_target
FROM tiket_atm_crm a
JOIN jenis_tiket b ON a.rtl_problem = b.id
GROUP BY a.rtl_problem ORDER BY tiket_close DESC;

-- Rate tiket seminggu terakhir (atm crm)
SELECT last_update, COUNT(1) AS tiket_close, 
COUNT(CASE WHEN last_update - input_date <= b.target_hari THEN 1 ELSE null END) AS target_in,
COUNT(CASE WHEN last_update - input_date > b.target_hari THEN 1 ELSE null END) AS target_out,
ROUND(
    COUNT(CASE WHEN last_update - input_date <= b.target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2) 
    AS rate_target
FROM tiket_atm_crm a
JOIN jenis_tiket b ON a.rtl_problem = b.id
WHERE last_update BETWEEN CURRENT_DATE-6 AND CURRENT_DATE
GROUP BY last_update ORDER BY last_update DESC;