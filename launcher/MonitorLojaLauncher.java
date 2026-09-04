package com.moveis.launcher;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import javax.swing.*;
import java.awt.*;
import java.io.*;
import java.net.*;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

/**
 * Monitor de Atendimentos e Vendas - Launcher Executável em Java
 *
 * Inicia um servidor HTTP local de alta performance sem nenhuma dependência externa,
 * servindo o aplicativo 100% offline e abrindo automaticamente no navegador ou modo App no Windows.
 */
public class MonitorLojaLauncher {

    private static final int DEFAULT_PORT = 3000;
    private static final Map<String, String> MIME_TYPES = new HashMap<>();

    static {
        MIME_TYPES.put("html", "text/html; charset=UTF-8");
        MIME_TYPES.put("htm", "text/html; charset=UTF-8");
        MIME_TYPES.put("js", "application/javascript; charset=UTF-8");
        MIME_TYPES.put("mjs", "application/javascript; charset=UTF-8");
        MIME_TYPES.put("css", "text/css; charset=UTF-8");
        MIME_TYPES.put("json", "application/json; charset=UTF-8");
        MIME_TYPES.put("svg", "image/svg+xml");
        MIME_TYPES.put("png", "image/png");
        MIME_TYPES.put("jpg", "image/jpeg");
        MIME_TYPES.put("jpeg", "image/jpeg");
        MIME_TYPES.put("ico", "image/x-icon");
        MIME_TYPES.put("webp", "image/webp");
        MIME_TYPES.put("woff", "font/woff");
        MIME_TYPES.put("woff2", "font/woff2");
        MIME_TYPES.put("ttf", "font/ttf");
        MIME_TYPES.put("webmanifest", "application/manifest+json");
    }

    public static void main(String[] args) {
        System.out.println("===============================================================");
        System.out.println("   MONITOR DE ATENDIMENTOS E VENDAS - LOJA DE MÓVEIS (JAVA)   ");
        System.out.println("===============================================================");
        System.out.println("Iniciando servidor local 100% offline...");

        int port = findAvailablePort(DEFAULT_PORT);
        HttpServer server = null;

        try {
            server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
            server.createContext("/", new StaticFileHandler());
            server.setExecutor(null); // Cria um executor padrão
            server.start();

            String appUrl = "http://localhost:" + port;
            System.out.println("[OK] Servidor ativo em: " + appUrl);
            System.out.println("Abrindo aplicativo no navegador padrão...");

            // Abrir navegador automaticamente
            openBrowser(appUrl);

            // Exibir janela gráfica de controle se houver suporte a interface
            if (!GraphicsEnvironment.isHeadless()) {
                showControlWindow(appUrl, server);
            } else {
                System.out.println("Pressione Ctrl+C no terminal para encerrar o aplicativo.");
            }

        } catch (Exception e) {
            System.err.println("[ERRO] Falha ao iniciar servidor local: " + e.getMessage());
            e.printStackTrace();
            if (!GraphicsEnvironment.isHeadless()) {
                JOptionPane.showMessageDialog(
                    null,
                    "Erro ao iniciar o servidor local:\n" + e.getMessage(),
                    "Erro - Monitor de Atendimentos",
                    JOptionPane.ERROR_MESSAGE
                );
            }
        }
    }

    private static int findAvailablePort(int preferredPort) {
        for (int p = preferredPort; p < preferredPort + 50; p++) {
            try (ServerSocket socket = new ServerSocket(p, 1, InetAddress.getByName("127.0.0.1"))) {
                return p;
            } catch (IOException ignored) {
                // Porta ocupada, testa a próxima
            }
        }
        return 0; // Pega qualquer porta livre do sistema operacional
    }

    private static void openBrowser(String url) {
        // Tenta abrir no modo App do Edge ou Chrome (Janela limpa como .exe)
        String os = System.getProperty("os.name", "").toLowerCase();
        if (os.contains("win")) {
            try {
                // Modo aplicativo limpo no Edge (nativo em 100% dos PCs Windows 10/11)
                ProcessBuilder pb = new ProcessBuilder("cmd", "/c", "start msedge --app=" + url);
                pb.start();
                return;
            } catch (Exception ignored) {
                try {
                    ProcessBuilder pb = new ProcessBuilder("cmd", "/c", "start chrome --app=" + url);
                    pb.start();
                    return;
                } catch (Exception ignored2) {}
            }
        }

        // Fallback para o navegador padrão do sistema
        if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
            try {
                Desktop.getDesktop().browse(new URI(url));
                return;
            } catch (Exception e) {
                System.err.println("Não foi possível acionar o navegador automaticamente: " + e.getMessage());
            }
        }

        System.out.println("Abra manualmente seu navegador e acesse: " + url);
    }

    private static void showControlWindow(String appUrl, HttpServer server) {
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception ignored) {}

            JFrame frame = new JFrame("Monitor de Atendimentos - Loja de Móveis");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setSize(440, 220);
            frame.setLocationRelativeTo(null);
            frame.setResizable(false);

            JPanel panel = new JPanel();
            panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
            panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

            JLabel titleLabel = new JLabel("● Monitor de Atendimentos Ativo");
            titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 15));
            titleLabel.setForeground(new Color(16, 149, 102));
            titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

            JLabel infoLabel = new JLabel("Rodando 100% offline em: " + appUrl);
            infoLabel.setFont(new Font("Segoe UI", Font.PLAIN, 12));
            infoLabel.setForeground(new Color(71, 85, 105));
            infoLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

            JLabel hintLabel = new JLabel("Mantenha esta janela aberta enquanto utilizar o programa.");
            hintLabel.setFont(new Font("Segoe UI", Font.ITALIC, 11));
            hintLabel.setForeground(new Color(100, 116, 139));
            hintLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

            JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 12, 10));

            JButton btnOpen = new JButton("Reabrir no Navegador");
            btnOpen.addActionListener(e -> openBrowser(appUrl));

            JButton btnExit = new JButton("Encerrar Aplicativo");
            btnExit.addActionListener(e -> {
                server.stop(0);
                System.exit(0);
            });

            buttonPanel.add(btnOpen);
            buttonPanel.add(btnExit);
            buttonPanel.setAlignmentX(Component.CENTER_ALIGNMENT);

            panel.add(titleLabel);
            panel.add(Box.createRigidArea(new Dimension(0, 8)));
            panel.add(infoLabel);
            panel.add(Box.createRigidArea(new Dimension(0, 4)));
            panel.add(hintLabel);
            panel.add(Box.createRigidArea(new Dimension(0, 16)));
            panel.add(buttonPanel);

            frame.add(panel);
            frame.setVisible(true);
        });
    }

    /**
     * Handler HTTP que busca os arquivos estáticos na pasta 'dist' local
     * ou nos recursos empacotados dentro do arquivo JAR.
     */
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            byte[] content = resolveContent(path);
            if (content == null) {
                // SPA Fallback: rotas não encontradas retornam index.html
                content = resolveContent("/index.html");
            }

            if (content == null) {
                String notFound = "<h1>404 - Arquivo não encontrado</h1><p>Verifique se os arquivos compilados estão na pasta 'dist' ou no JAR.</p>";
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                exchange.sendResponseHeaders(404, notFound.getBytes().length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(notFound.getBytes());
                }
                return;
            }

            String contentType = getMimeType(path);
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.getResponseHeaders().set("Cache-Control", "no-cache");
            exchange.sendResponseHeaders(200, content.length);

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(content);
            }
        }

        private byte[] resolveContent(String requestPath) {
            // 1. Tentar ler da pasta 'dist' no diretório atual de execução
            File baseDir = new File(System.getProperty("user.dir"));
            File fileInDist = new File(baseDir, "dist" + requestPath);
            if (fileInDist.exists() && fileInDist.isFile()) {
                try {
                    return Files.readAllBytes(fileInDist.toPath());
                } catch (IOException ignored) {}
            }

            // 2. Tentar ler diretamente sem subpasta dist
            File fileDirect = new File(baseDir, requestPath.startsWith("/") ? requestPath.substring(1) : requestPath);
            if (fileDirect.exists() && fileDirect.isFile()) {
                try {
                    return Files.readAllBytes(fileDirect.toPath());
                } catch (IOException ignored) {}
            }

            // 3. Tentar carregar como recurso embutido dentro do JAR (/dist/ ou /web/)
            InputStream is = getClass().getResourceAsStream("/dist" + requestPath);
            if (is == null) {
                is = getClass().getResourceAsStream(requestPath);
            }

            if (is != null) {
                try (ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
                    byte[] data = new byte[8192];
                    int nRead;
                    while ((nRead = is.read(data, 0, data.length)) != -1) {
                        buffer.write(data, 0, nRead);
                    }
                    return buffer.toByteArray();
                } catch (IOException ignored) {}
            }

            return null;
        }

        private String getMimeType(String path) {
            int lastDot = path.lastIndexOf('.');
            if (lastDot > 0 && lastDot < path.length() - 1) {
                String ext = path.substring(lastDot + 1).toLowerCase();
                return MIME_TYPES.getOrDefault(ext, "application/octet-stream");
            }
            return "text/html; charset=UTF-8";
        }
    }
}
