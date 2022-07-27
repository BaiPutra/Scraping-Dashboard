-- total closed tiket seminggu terakhir
SELECT COUNT(1) AS total_close_tiket, 
COUNT(
    CASE WHEN updateTicket- entryTicket <= target_hari THEN 1 ELSE null END) AS target_in,
ROUND(
    COUNT(
        CASE WHEN updateTicket - entryTicket <= target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2) AS rate_target
FROM tiket
WHERE updateTicket BETWEEN CURRENT_DATE-6 AND CURRENT_DATE;

-- Performa Pemasang (tiket_edc)
SELECT pemasang, COUNT(1) AS tiket_close,
COUNT(CASE WHEN updateTicket - entryTicket <= target_hari THEN 1 ELSE null END) AS target_in,
COUNT(CASE WHEN updateTicket - entryTicket > target_hari THEN 1 ELSE null END) AS target_out,
ROUND(
    COUNT(CASE WHEN updateTicket - entryTicket <= target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2)
    AS rate_target
FROM tiket
GROUP BY pemasang ORDER BY tiket_close DESC;

-- List per jenis tiket (edc)
SELECT jenisMasalah, COUNT(1) AS tiket_close,
COUNT(CASE WHEN updateTicket - entryTicket <= target_hari THEN 1 ELSE null END) AS target_in,
COUNT(CASE WHEN updateTicket - entryTicket > target_hari THEN 1 ELSE null END) AS target_out,
ROUND(
    COUNT(CASE WHEN updateTicket - entryTicket <= target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2)
    AS rate_target
FROM tiket
WHERE bagian = 'EDC'
GROUP BY jenisMasalah ORDER BY tiket_close DESC;

-- Rate tiket dalam seminggu terakhir
SELECT updateTicket, COUNT(1) AS tiket_close,
COUNT(CASE WHEN updateTicket - entryTicket <= target_hari THEN 1 ELSE null END) AS target_in,
COUNT(CASE WHEN updateTicket - entryTicket > target_hari THEN 1 ELSE null END) AS target_out,
ROUND(
    COUNT(CASE WHEN updateTicket - entryTicket <= target_hari THEN 1 ELSE null END) / COUNT(1) * 100, 2) 
    AS rate_target
FROM tiket
WHERE updateTicket BETWEEN CURRENT_DATE-6 AND CURRENT_DATE
GROUP BY updateTicket ORDER BY updateTicket DESC;

-- per minggu'
SELECT WEEK(updateTicket) weeks,
COUNT(updateTicket) as total
FROM tiket 
WHERE updateTicket > DATE_SUB(NOW(), INTERVAL 2 WEEK)
GROUP BY WEEK(updateTicket)
ORDER BY updateTicket;