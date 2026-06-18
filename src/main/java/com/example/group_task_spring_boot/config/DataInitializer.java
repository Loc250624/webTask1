package com.example.group_task_spring_boot.config;

import com.example.group_task_spring_boot.entity.Product;
import com.example.group_task_spring_boot.entity.User;
import com.example.group_task_spring_boot.entity.UserRole;
import com.example.group_task_spring_boot.repository.ProductRepository;
import com.example.group_task_spring_boot.repository.UserRepository;
import com.example.group_task_spring_boot.repository.UserRoleRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        UserRole adminRole = userRoleRepository.findByName("admin")
                .orElseGet(() -> userRoleRepository.save(UserRole.builder().name("admin").build()));
        UserRole customerRole = userRoleRepository.findByName("khách hàng")
                .orElseGet(() -> userRoleRepository.save(UserRole.builder().name("khách hàng").build()));

        // 2. Seed Default Admin
        if (!userRepository.existsByUsername("admin")) {
            User adminUser = User.builder()
                    .username("admin")
                    .email("admin@example.com")
                    .password(BCrypt.hashpw("admin123", BCrypt.gensalt()))
                    .role(adminRole)
                    .build();
            userRepository.save(adminUser);
            System.out.println("--- Seeded default admin user ---");
        }

        // 3. Seed Default Customer
        if (!userRepository.existsByUsername("customer")) {
            User customerUser = User.builder()
                    .username("customer")
                    .email("customer@example.com")
                    .password(BCrypt.hashpw("customer123", BCrypt.gensalt()))
                    .role(customerRole)
                    .build();
            userRepository.save(customerUser);
            System.out.println("--- Seeded default customer user ---");
        }

        // 4. Seed Products
        if (productRepository.count() == 0) {
            Product flask = Product.builder()
                    .name("Insulated Eco-Flask")
                    .category("lifestyle")
                    .price(28.00)
                    .description("Double-walled vacuum insulated stainless steel water bottle. Keeps beverages cold for 24 hours or hot for 12. Matte, durable grip finish.")
                    .imageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80")
                    .rating(5.0)
                    .reviewCount(48)
                    .build();

            Product tote = Product.builder()
                    .name("Organic Woven Tote")
                    .category("home")
                    .price(16.00)
                    .description("100% GOTS certified organic cotton woven tote bag. Heavy-duty construction with reinforced stitching. Perfect for plastic-free grocery shopping.")
                    .imageUrl("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80")
                    .rating(4.5)
                    .reviewCount(32)
                    .build();

            Product soap = Product.builder()
                    .name("Botanical Soap Trio")
                    .category("personal")
                    .price(9.50)
                    .description("Cold-processed organic soap bars scented with lavender, lemongrass, and eucalyptus essential oils. Fully biodegradable ingredients and paper packaging.")
                    .imageUrl("https://images.unsplash.com/photo-1546552768-9e3a94b38a59?auto=format&fit=crop&w=800&q=80")
                    .rating(5.0)
                    .reviewCount(64)
                    .build();

            Product toothbrush = Product.builder()
                    .name("Bamboo Toothbrushes")
                    .category("personal")
                    .price(12.00)
                    .description("Pack of 4 biodegradable bamboo toothbrushes with soft charcoal-infused nylon bristles. Ergonomic water-resistant handle.")
                    .imageUrl("https://images.unsplash.com/photo-1589365252845-092198ba5334?auto=format&fit=crop&w=800&q=80")
                    .rating(5.0)
                    .reviewCount(120)
                    .build();

            Product notebook = Product.builder()
                    .name("Cork Bound Notebook")
                    .category("home")
                    .price(18.50)
                    .description("Sustainably harvested natural cork cover notebook with 160 pages of recycled, acid-free lined paper. Ideal for journaling and notes.")
                    .imageUrl("https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80")
                    .rating(4.5)
                    .reviewCount(21)
                    .build();

            Product wrap = Product.builder()
                    .name("Beeswax Food Wraps")
                    .category("home")
                    .price(14.00)
                    .description("Set of 3 reusable beeswax food wraps made from organic cotton, organic jojoba oil, and pine resin. Natural alternative to plastic cling wrap.")
                    .imageUrl("https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80")
                    .rating(4.0)
                    .reviewCount(54)
                    .build();

            Product deodorant = Product.builder()
                    .name("Charcoal Deodorant")
                    .category("personal")
                    .price(11.00)
                    .description("All-natural, aluminum-free solid deodorant stick formulated with activated charcoal, arrowroot powder, and shea butter. Cardboard push-up tube.")
                    .imageUrl("https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80")
                    .rating(5.0)
                    .reviewCount(89)
                    .build();

            Product bowls = Product.builder()
                    .name("Coconut Shell Bowls")
                    .category("lifestyle")
                    .price(15.00)
                    .description("Set of 2 handcrafted coconut bowls made from reclaimed shells. Polished with organic virgin coconut oil. Includes two matching ebony wooden spoons.")
                    .imageUrl("https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80")
                    .rating(4.5)
                    .reviewCount(76)
                    .build();

            productRepository.saveAll(Arrays.asList(flask, tote, soap, toothbrush, notebook, wrap, deodorant, bowls));
            System.out.println("--- Seeded 8 sustainable products to database ---");
        }

        // 5. Seed 50 products from products.sql if database has only default products
        if (productRepository.count() <= 8) {
            try {
                org.springframework.core.io.Resource resource = new org.springframework.core.io.ClassPathResource("data/products.sql");
                java.io.InputStream inputStream = resource.getInputStream();
                java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(inputStream, java.nio.charset.StandardCharsets.UTF_8));
                StringBuilder sqlBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.trim().startsWith("--") && !line.trim().isEmpty()) {
                        sqlBuilder.append(line).append("\n");
                    }
                }
                String sql = sqlBuilder.toString().trim();
                if (!sql.isEmpty()) {
                    jdbcTemplate.execute(sql);
                    System.out.println("--- Successfully seeded 50 products from products.sql ---");
                }
            } catch (Exception e) {
                System.err.println("Failed to seed products from SQL file: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
