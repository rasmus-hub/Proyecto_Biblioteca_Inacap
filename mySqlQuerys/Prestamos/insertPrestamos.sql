SELECT * FROM prestamos;

SELECT * FROM detallePrestamo;

DELETE FROM prestamos
WHERE PrestamoID = 8;

DELETE FROM prestamos
WHERE PrestamoID = 6;

SELECT * FROM detallePrestamo AS dP
JOIN libro AS L
ON (dP.LibroID = L.LibroID);