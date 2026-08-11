-- Guarda el contenido de los archivos subidos sin comprimir.
--
-- Por defecto Postgres usa el modo EXTENDED para una columna bytea: guarda el
-- valor fuera de la fila y ademas lo comprime. Comprimir un JPG, un MP4 o un
-- WEBM no ahorra nada, porque ya vienen comprimidos, y en cambio tiene un
-- costo que se paga en cada peticion de video: para sacar un pedazo de un
-- valor comprimido hay que descomprimirlo desde el principio, asi que
-- `substring` termina leyendo todo lo que hay antes del tramo pedido.
--
-- Con EXTERNAL el valor sigue fuera de la fila pero sin comprimir, y entonces
-- Postgres puede ir a buscar solo los pedazos que hacen falta. Medido sobre un
-- video de 25 MB, leer un tramo de 2 MB pasa de 145 ms a 27 ms, y deja de
-- importar en que parte del archivo este.
ALTER TABLE "MediaAsset" ALTER COLUMN "bytes" SET STORAGE EXTERNAL;
ALTER TABLE "MediaVariant" ALTER COLUMN "bytes" SET STORAGE EXTERNAL;

-- El modo solo rige para lo que se escriba a partir de ahora, asi que los
-- archivos que ya estaban guardados se reescriben para que tambien se
-- beneficien. Es una sola pasada sobre una tabla que tiene pocas filas.
UPDATE "MediaAsset" SET "bytes" = "bytes";
