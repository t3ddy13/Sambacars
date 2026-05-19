-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 19-Maio-2026 às 09:23
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `sambacarro`
--
CREATE DATABASE IF NOT EXISTS `sambacarro` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `sambacarro`;

-- --------------------------------------------------------

--
-- Estrutura da tabela `carrinho`
--

DROP TABLE IF EXISTS `carrinho`;
CREATE TABLE `carrinho` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `added_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `carros`
--

DROP TABLE IF EXISTS `carros`;
CREATE TABLE `carros` (
  `id` int(11) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `year` int(11) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `mileage` int(11) DEFAULT 0,
  `fuel` varchar(50) DEFAULT 'Gasolina',
  `transmission` varchar(50) DEFAULT 'Manual',
  `color` varchar(50) DEFAULT 'Branco',
  `description` text DEFAULT NULL,
  `image` varchar(500) DEFAULT '',
  `available` tinyint(1) DEFAULT 1,
  `featured` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `carros`
--

INSERT INTO `carros` (`id`, `brand`, `model`, `year`, `price`, `mileage`, `fuel`, `transmission`, `color`, `description`, `image`, `available`, `featured`, `created_at`) VALUES
(1, 'Toyota', 'Hilux', 2022, 45000.00, 15000, 'Gasóleo', 'Manual', 'Prata', 'Toyota Hilux robusta e confiável, ideal para terrenos angolanos. 4x4 com excelente capacidade de carga.', 'imagens/Toyota Hilux 2022.png', 1, 1, '2026-05-14 19:24:22'),
(2, 'Toyota', 'Land Cruiser', 2021, 85000.00, 8000, 'Gasóleo', 'Automático', 'Preto', 'Land Cruiser V8 com máxima capacidade off-road, conforto premium e potência excepcional.', 'imagens/Toyota Land Cruiser 2021.jpg', 1, 1, '2026-05-14 19:24:22'),
(3, 'Hyundai', 'Tucson', 2023, 38000.00, 5000, 'Gasolina', 'Automático', 'Cinzento', 'SUV moderno com tecnologia avançada, econômico e espaçoso para toda a família.', 'imagens/Hyundai Tucson 2023.jpg', 1, 1, '2026-05-14 19:24:22'),
(4, 'Mitsubishi', 'L200', 2022, 42000.00, 20000, 'Gasóleo', 'Manual', 'Prata', 'Pickup resistente e versátil, perfeito para trabalho e aventura em qualquer terreno.', 'imagens/Mitsubishi L200 2022.jpg', 1, 0, '2026-05-14 19:24:22'),
(5, 'Kia', 'Sportage', 2023, 35000.00, 3000, 'Gasolina', 'Automático', 'Vermelho', 'SUV elegante com design moderno, cheio de tecnologia e conforto para o dia a dia.', 'imagens/Kia Sportage 2023.png', 1, 1, '2026-05-14 19:24:22'),
(6, 'Ford', 'Ranger', 2021, 48000.00, 30000, 'Gasóleo', 'Automático', 'Branco', 'Pickup poderosa com capacidade de reboque e espaço para toda a família nas viagens.', 'imagens/Ford Ranger 2021.jpg', 1, 0, '2026-05-14 19:24:22'),
(7, 'Nissan', 'X-Trail', 2022, 33000.00, 12000, 'Gasolina', 'Automático', 'Vermelho', 'SUV familiar com 7 lugares, economia de combustível e ótimo custo-benefício.', 'imagens/Nissan X-Trail 2022.jpg', 1, 0, '2026-05-14 19:24:22'),
(8, 'Honda', 'CR-V', 2023, 40000.00, 2000, 'Gasolina', 'Automático', 'Vermelho', 'SUV elegante com motorização eficiente, interior espaçoso e segurança de ponta.', 'imagens/Honda CR-V 2023.png', 1, 1, '2026-05-14 19:24:22');

-- --------------------------------------------------------

--
-- Estrutura da tabela `cliente`
--

DROP TABLE IF EXISTS `cliente`;
CREATE TABLE `cliente` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('cliente','admin') DEFAULT 'cliente',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `cliente`
--

INSERT INTO `cliente` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Administrador', 'admin@sambacarro.ao', '$2a$10$81xF7XpXFRB4B/uOU5wGDuKYGw6zxwxysXYSJHP/Qz9tl22G6k8yy', 'admin', '2026-05-14 19:24:22'),
(2, 'Cliente Demo', 'cliente@email.com', '$2a$10$H1w1FO1W5VlrQ6yyKizKOe5u9u0JrTq/XJoW22wX8lzZPyqpdbOri', 'cliente', '2026-05-14 19:24:22');

-- --------------------------------------------------------

--
-- Estrutura da tabela `compras`
--

DROP TABLE IF EXISTS `compras`;
CREATE TABLE `compras` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `purchase_date` datetime DEFAULT current_timestamp(),
  `total_price` decimal(12,2) NOT NULL,
  `status` enum('pendente','confirmado','cancelado') DEFAULT 'confirmado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `carrinho`
--
ALTER TABLE `carrinho`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `car_id` (`car_id`);

--
-- Índices para tabela `carros`
--
ALTER TABLE `carros`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices para tabela `compras`
--
ALTER TABLE `compras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `car_id` (`car_id`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `carrinho`
--
ALTER TABLE `carrinho`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `carros`
--
ALTER TABLE `carros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `compras`
--
ALTER TABLE `compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `carrinho`
--
ALTER TABLE `carrinho`
  ADD CONSTRAINT `carrinho_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `carrinho_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `carros` (`id`);

--
-- Limitadores para a tabela `compras`
--
ALTER TABLE `compras`
  ADD CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `compras_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `carros` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
