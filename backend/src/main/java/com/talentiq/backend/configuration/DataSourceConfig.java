package com.talentiq.backend.configuration;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    private static final String LOCAL_IN_MEMORY_H2_URL =
            "jdbc:h2:mem:talentiq;DB_CLOSE_DELAY=-1;MODE=MySQL;NON_KEYWORDS=USER";

    private final Environment environment;

    public DataSourceConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        boolean isProduction = isProductionEnvironment();
        boolean isH2Explicit = isExplicitH2Requested();

        log.info("[DataSourceConfig] Environment check: isProduction={}, isExplicitH2={}", isProduction, isH2Explicit);

        DbConnectionParams params = resolveConnectionParams(isProduction, isH2Explicit);
        log.info("[DataSourceConfig] Resolved database target URL: {}", sanitizeUrl(params.jdbcUrl));

        HikariDataSource primaryDataSource = null;
        try {
            HikariConfig config = buildHikariConfig(params);
            primaryDataSource = new HikariDataSource(config);

            // Fast connection probe to verify connectivity before Hibernate attempts to initialize
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

            // In production, NEVER silently switch to an embedded database; fail fast with clear instructions
            if (isProduction && !isH2Explicit) {
                String errorMsg = String.format("""
                        
                        ====================================================================================================
                        [FATAL DATABASE ERROR] Failed to connect to Production MySQL Database on Render!
                        
                        Configured URL: %s
                        Root Exception: %s
                        
                        Checklist for Render Deployment:
                        1. Verify DATABASE_URL is correct in Render Dashboard (Environment tab).
                        2. If using Cloud MySQL (Aiven, TiDB, Clever Cloud, Railway, AWS RDS):
                           Ensure your database allows connections from all incoming IPs (0.0.0.0/0).
                        3. Verify DATABASE_USER and DATABASE_PASSWORD credentials.
                        4. Ensure SSL parameters are enabled (?useSSL=true&allowPublicKeyRetrieval=true).
                        ====================================================================================================
                        """, sanitizeUrl(params.jdbcUrl), e.getMessage());
                log.error(errorMsg);
                throw new IllegalStateException(errorMsg, e);
            }

            // In local or test environments, fallback to in-memory H2 so local builds and tests run cleanly
            log.warn("[DataSourceConfig] Local/Test mode: Falling back to in-memory H2 database.");
            DbConnectionParams fallbackParams = new DbConnectionParams(
                    LOCAL_IN_MEMORY_H2_URL,
                    "sa",
                    "",
                    "org.h2.Driver",
                    true
            );
            HikariConfig fallbackConfig = buildHikariConfig(fallbackParams);
            return new HikariDataSource(fallbackConfig);
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

    private DbConnectionParams resolveConnectionParams(boolean isProduction, boolean isH2Explicit) {
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

        // 1. Check discrete host variables if URL not provided directly
        if ((rawUrl == null || rawUrl.isBlank()) && (System.getenv("DATABASE_HOST") != null || System.getenv("MYSQL_HOST") != null)) {
            String host = getFirstNonBlank(System.getenv("DATABASE_HOST"), System.getenv("MYSQL_HOST"));
            String port = getFirstNonBlank(System.getenv("DATABASE_PORT"), System.getenv("MYSQL_PORT"), "3306");
            String db = getFirstNonBlank(System.getenv("DATABASE_NAME"), System.getenv("MYSQL_DATABASE"), "talentiq");
            rawUrl = String.format("jdbc:mysql://%s:%s/%s", host, port, db);
        }

        // 2. Production validation: Fail immediately if database variables are completely missing in production
        if (isProduction && !isH2Explicit && (rawUrl == null || rawUrl.isBlank())) {
            String missingConfigMsg = """
                    
                    ====================================================================================================
                    [FATAL CONFIGURATION ERROR] Missing Production MySQL Database Configuration on Render!
                    
                    TalentIQ is running in PRODUCTION and REQUIRES a valid Cloud MySQL database.
                    No database connection URL or host was detected in the environment.
                    
                    To fix this, please configure the following Environment Variables in your Render Dashboard:
                    (Render Dashboard -> Your Web Service -> Environment -> Add Environment Variable)
                    
                    1. DATABASE_URL
                       - Standard JDBC URL:
                         jdbc:mysql://<host>:<port>/<database>?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
                       - OR standard URI:
                         mysql://<username>:<password>@<host>:<port>/<database>
                    
                    2. DATABASE_USER (Required if not embedded in DATABASE_URL URI)
                       e.g., your MySQL username (root, admin, etc.)
                    
                    3. DATABASE_PASSWORD (Required if not embedded in DATABASE_URL URI)
                       e.g., your MySQL password
                    
                    4. GEMINI_API_KEY
                       Your Google Gemini API Key for AI Copilot, resume analysis, and interview generation.
                    
                    Note: Automatic fallback to an embedded database in production is disabled for data integrity.
                    ====================================================================================================
                    """;
            log.error(missingConfigMsg);
            throw new IllegalStateException(missingConfigMsg);
        }

        // 3. If local/test and unconfigured, use in-memory H2
        if (rawUrl == null || rawUrl.isBlank() || isH2Explicit) {
            log.info("[DataSourceConfig] Local/Test environment without external database. Using in-memory H2 database.");
            return new DbConnectionParams(LOCAL_IN_MEMORY_H2_URL, "sa", "", "org.h2.Driver", true);
        }

        String trimmedUrl = rawUrl.trim();

        // 4. Handle standard URI format: mysql://user:pass@host:port/dbname
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

        // 5. Handle standard JDBC MySQL URL: jdbc:mysql://...
        if (trimmedUrl.startsWith("jdbc:mysql:")) {
            StringBuilder jdbcUrl = new StringBuilder(trimmedUrl);
            appendCloudMySqlOptions(jdbcUrl, null);
            return new DbConnectionParams(jdbcUrl.toString(), username, password, "com.mysql.cj.jdbc.Driver", false);
        }

        // 6. Handle explicit H2 URL
        if (trimmedUrl.startsWith("jdbc:h2:")) {
            return new DbConnectionParams(trimmedUrl, username != null ? username : "sa", password != null ? password : "", "org.h2.Driver", true);
        }

        // 7. Generic JDBC URL
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

    private boolean isProductionEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("prod".equalsIgnoreCase(profile) || "production".equalsIgnoreCase(profile)) {
                return true;
            }
        }

        if ("true".equalsIgnoreCase(System.getenv("RENDER"))) {
            return true;
        }

        String springProfileEnv = System.getenv("SPRING_PROFILES_ACTIVE");
        if (springProfileEnv != null && (springProfileEnv.contains("prod") || springProfileEnv.contains("production"))) {
            return true;
        }

        return false;
    }

    private boolean isExplicitH2Requested() {
        String dbType = System.getenv("DATABASE_TYPE");
        if ("h2".equalsIgnoreCase(dbType)) {
            return true;
        }

        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("test".equalsIgnoreCase(profile) || "h2".equalsIgnoreCase(profile)) {
                return true;
            }
        }

        return false;
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
