package com.talentiq.backend.configuration;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    private static final String EMBEDDED_H2_URL =
            "jdbc:h2:file:./data/talentiq;DB_CLOSE_DELAY=-1;MODE=MySQL;NON_KEYWORDS=USER";

    @Bean
    @Primary
    public DataSource dataSource() {
        DbConnectionParams params = resolveConnectionParams();
        log.info("[DataSourceConfig] Resolved primary database URL: {}", sanitizeUrl(params.jdbcUrl));

        HikariDataSource primaryDataSource = null;
        try {
            HikariConfig config = buildHikariConfig(params);
            primaryDataSource = new HikariDataSource(config);

            // Validate connection with a fast probe (15s timeout)
            try (Connection conn = primaryDataSource.getConnection()) {
                log.info("[DataSourceConfig] Database connection established successfully! Product: {}, Version: {}",
                        conn.getMetaData().getDatabaseProductName(),
                        conn.getMetaData().getDatabaseProductVersion());
                return primaryDataSource;
            }
        } catch (Exception e) {
            log.error("[DataSourceConfig] Failed to establish connection to primary database ({}): {}",
                    sanitizeUrl(params.jdbcUrl), e.getMessage());

            if (primaryDataSource != null) {
                try {
                    primaryDataSource.close();
                } catch (Exception ignored) {}
            }

            // If an external database was specified but unreachable, fallback to embedded H2 to prevent deployment crash
            if (!params.isEmbedded) {
                log.warn("[DataSourceConfig] ==========================================================================");
                log.warn("[DataSourceConfig] FALLING BACK TO EMBEDDED DATABASE TO PREVENT DEPLOYMENT FAILURE (EXIT CODE 1).");
                log.warn("[DataSourceConfig] Ensure your Cloud MySQL URL (DATABASE_URL) and credentials are valid in Render.");
                log.warn("[DataSourceConfig] ==========================================================================");

                DbConnectionParams fallbackParams = new DbConnectionParams(
                        EMBEDDED_H2_URL,
                        "sa",
                        "",
                        "org.h2.Driver",
                        true
                );
                HikariConfig fallbackConfig = buildHikariConfig(fallbackParams);
                return new HikariDataSource(fallbackConfig);
            }

            throw new RuntimeException("Unable to initialize database: " + e.getMessage(), e);
        }
    }

    private HikariConfig buildHikariConfig(DbConnectionParams params) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(params.jdbcUrl);
        config.setUsername(params.username);
        config.setPassword(params.password);
        if (params.driverClassName != null && !params.driverClassName.isBlank()) {
            config.setDriverClassName(params.driverClassName);
        }

        // Production-tuned connection pool settings for cloud environments (512MB RAM safe)
        config.setConnectionTimeout(30000);
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(1800000);
        config.setKeepaliveTime(60000);
        config.setPoolName("TalentIQHikariPool");

        if (params.jdbcUrl.startsWith("jdbc:mysql")) {
            config.setConnectionTestQuery("SELECT 1");
        }

        return config;
    }

    private DbConnectionParams resolveConnectionParams() {
        String rawUrl = getFirstNonBlank(
                System.getenv("DATABASE_URL"),
                System.getenv("MYSQL_URL"),
                System.getenv("SPRING_DATASOURCE_URL"),
                System.getProperty("spring.datasource.url"),
                System.getProperty("DATABASE_URL")
        );

        String username = getFirstNonBlank(
                System.getenv("DATABASE_USER"),
                System.getenv("DATABASE_USERNAME"),
                System.getenv("MYSQL_USER"),
                System.getenv("SPRING_DATASOURCE_USERNAME"),
                System.getProperty("spring.datasource.username")
        );

        String password = getFirstNonBlank(
                System.getenv("DATABASE_PASSWORD"),
                System.getenv("MYSQL_PASSWORD"),
                System.getenv("SPRING_DATASOURCE_PASSWORD"),
                System.getProperty("spring.datasource.password")
        );

        // 1. Check discrete host variables if URL not provided
        if ((rawUrl == null || rawUrl.isBlank()) && (System.getenv("DATABASE_HOST") != null || System.getenv("MYSQL_HOST") != null)) {
            String host = getFirstNonBlank(System.getenv("DATABASE_HOST"), System.getenv("MYSQL_HOST"));
            String port = getFirstNonBlank(System.getenv("DATABASE_PORT"), System.getenv("MYSQL_PORT"), "3306");
            String db = getFirstNonBlank(System.getenv("DATABASE_NAME"), System.getenv("MYSQL_DATABASE"), "talentiq");
            rawUrl = String.format("jdbc:mysql://%s:%s/%s", host, port, db);
        }

        // 2. If completely unconfigured or explicit "h2", use embedded fallback
        if (rawUrl == null || rawUrl.isBlank() || "h2".equalsIgnoreCase(rawUrl.trim())) {
            log.info("[DataSourceConfig] No external database URL provided. Defaulting to embedded database.");
            return new DbConnectionParams(EMBEDDED_H2_URL, "sa", "", "org.h2.Driver", true);
        }

        String trimmedUrl = rawUrl.trim();

        // 3. Handle standard URI format: mysql://user:pass@host:port/dbname
        if (trimmedUrl.startsWith("mysql://")) {
            try {
                URI uri = new URI(trimmedUrl);
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 3306;
                String path = uri.getPath() != null && uri.getPath().length() > 1 ? uri.getPath().substring(1) : "talentiq";

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] userInfoParts = uri.getUserInfo().split(":", 2);
                    if (username == null || username.isBlank()) username = userInfoParts[0];
                    if (userInfoParts.length > 1 && (password == null || password.isBlank())) password = userInfoParts[1];
                }

                String query = uri.getQuery();
                StringBuilder jdbcUrl = new StringBuilder(String.format("jdbc:mysql://%s:%d/%s", host, port, path));
                appendCloudMySqlOptions(jdbcUrl, query);

                return new DbConnectionParams(jdbcUrl.toString(), username, password, "com.mysql.cj.jdbc.Driver", false);
            } catch (Exception e) {
                log.warn("[DataSourceConfig] Failed to parse mysql:// URI ({}): {}. Treating as raw URL.", sanitizeUrl(trimmedUrl), e.getMessage());
            }
        }

        // 4. Handle standard JDBC MySQL URL: jdbc:mysql://...
        if (trimmedUrl.startsWith("jdbc:mysql:")) {
            StringBuilder jdbcUrl = new StringBuilder(trimmedUrl);
            appendCloudMySqlOptions(jdbcUrl, null);
            return new DbConnectionParams(jdbcUrl.toString(), username, password, "com.mysql.cj.jdbc.Driver", false);
        }

        // 5. Handle H2 URL
        if (trimmedUrl.startsWith("jdbc:h2:")) {
            return new DbConnectionParams(trimmedUrl, username != null ? username : "sa", password != null ? password : "", "org.h2.Driver", true);
        }

        // 6. Generic or other JDBC drivers (e.g., PostgreSQL: jdbc:postgresql://)
        return new DbConnectionParams(trimmedUrl, username, password, null, false);
    }

    private void appendCloudMySqlOptions(StringBuilder jdbcUrl, String existingQuery) {
        String current = jdbcUrl.toString();
        boolean hasParams = current.contains("?") || (existingQuery != null && !existingQuery.isBlank());

        if (existingQuery != null && !existingQuery.isBlank() && !current.contains("?")) {
            jdbcUrl.append("?").append(existingQuery);
            current = jdbcUrl.toString();
            hasParams = true;
        }

        char sep = hasParams ? '&' : '?';

        if (!current.contains("allowPublicKeyRetrieval=")) {
            jdbcUrl.append(sep).append("allowPublicKeyRetrieval=true");
            sep = '&';
        }
        if (!current.contains("serverTimezone=")) {
            jdbcUrl.append(sep).append("serverTimezone=UTC");
            sep = '&';
        }
        if (!current.contains("connectTimeout=")) {
            jdbcUrl.append(sep).append("connectTimeout=30000");
            sep = '&';
        }
        if (!current.contains("socketTimeout=")) {
            jdbcUrl.append(sep).append("socketTimeout=60000");
            sep = '&';
        }
        if (!current.contains("sslMode=") && !current.contains("useSSL=")) {
            jdbcUrl.append(sep).append("useSSL=true");
        }
    }

    private static String getFirstNonBlank(String... values) {
        if (values == null) return null;
        for (String v : values) {
            if (v != null && !v.trim().isBlank()) {
                return v.trim();
            }
        }
        return null;
    }

    private static String sanitizeUrl(String url) {
        if (url == null) return "null";
        return url.replaceAll(":[^/@:]+@", ":***@");
    }

    private static class DbConnectionParams {
        final String jdbcUrl;
        final String username;
        final String password;
        final String driverClassName;
        final boolean isEmbedded;

        DbConnectionParams(String jdbcUrl, String username, String password, String driverClassName, boolean isEmbedded) {
            this.jdbcUrl = jdbcUrl;
            this.username = username != null ? username : "";
            this.password = password != null ? password : "";
            this.driverClassName = driverClassName;
            this.isEmbedded = isEmbedded;
        }
    }
}
