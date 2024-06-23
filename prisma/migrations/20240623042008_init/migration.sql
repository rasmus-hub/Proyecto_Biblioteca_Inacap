-- CreateTable
CREATE TABLE `Bibliotecario` (
    `Rut` VARCHAR(191) NOT NULL,
    `Nombre` VARCHAR(191) NOT NULL,
    `Apellido` VARCHAR(191) NOT NULL,
    `Usuario` VARCHAR(191) NOT NULL,
    `Contrasena` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `BibliotecaID` INTEGER NOT NULL,

    PRIMARY KEY (`Rut`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `Rut` VARCHAR(191) NOT NULL,
    `Nombres` VARCHAR(191) NOT NULL,
    `Apellidos` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `Tipo_usuario` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Rut`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Biblioteca` (
    `BibliotecaID` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(191) NOT NULL,
    `Direccion` VARCHAR(191) NOT NULL,
    `Telefono` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`BibliotecaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prestamos` (
    `PrestamoID` INTEGER NOT NULL AUTO_INCREMENT,
    `Fecha_Prestamo` DATETIME(3) NOT NULL,
    `Cantidad_Libros` INTEGER NOT NULL,
    `Estado_Prestamo` VARCHAR(191) NOT NULL,
    `Usuario_Rut` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`PrestamoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Multa` (
    `MultaID` INTEGER NOT NULL AUTO_INCREMENT,
    `Deuda` INTEGER NOT NULL,
    `Estado_Multa` VARCHAR(191) NOT NULL,
    `Prestamos_PrestamoID` INTEGER NOT NULL,

    UNIQUE INDEX `Multa_Prestamos_PrestamoID_key`(`Prestamos_PrestamoID`),
    PRIMARY KEY (`MultaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Libro` (
    `LibroID` INTEGER NOT NULL AUTO_INCREMENT,
    `Titulo` VARCHAR(191) NOT NULL,
    `Autor` VARCHAR(191) NOT NULL,
    `Editorial` VARCHAR(191) NOT NULL,
    `Ano_Publicacion` INTEGER NOT NULL,
    `Copias` INTEGER NOT NULL,
    `BibliotecaID` INTEGER NOT NULL,

    PRIMARY KEY (`LibroID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetallePrestamo` (
    `Prestamos_PrestamoID` INTEGER NOT NULL,
    `Libro_LibroID` INTEGER NOT NULL,
    `Estado_Detalle` VARCHAR(191) NOT NULL,
    `Fecha_Devolucion` DATETIME(3) NOT NULL,
    `Dias_Atraso` INTEGER NOT NULL,

    PRIMARY KEY (`Prestamos_PrestamoID`, `Libro_LibroID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Bibliotecario` ADD CONSTRAINT `Bibliotecario_BibliotecaID_fkey` FOREIGN KEY (`BibliotecaID`) REFERENCES `Biblioteca`(`BibliotecaID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamos` ADD CONSTRAINT `Prestamos_Usuario_Rut_fkey` FOREIGN KEY (`Usuario_Rut`) REFERENCES `Usuario`(`Rut`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Multa` ADD CONSTRAINT `Multa_Prestamos_PrestamoID_fkey` FOREIGN KEY (`Prestamos_PrestamoID`) REFERENCES `Prestamos`(`PrestamoID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Libro` ADD CONSTRAINT `Libro_BibliotecaID_fkey` FOREIGN KEY (`BibliotecaID`) REFERENCES `Biblioteca`(`BibliotecaID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetallePrestamo` ADD CONSTRAINT `DetallePrestamo_Prestamos_PrestamoID_fkey` FOREIGN KEY (`Prestamos_PrestamoID`) REFERENCES `Prestamos`(`PrestamoID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetallePrestamo` ADD CONSTRAINT `DetallePrestamo_Libro_LibroID_fkey` FOREIGN KEY (`Libro_LibroID`) REFERENCES `Libro`(`LibroID`) ON DELETE RESTRICT ON UPDATE CASCADE;
