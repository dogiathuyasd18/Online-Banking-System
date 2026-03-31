// package com.banking.config;

// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
// import org.springframework.util.StringUtils;
// import org.springframework.web.filter.OncePerRequestFilter;

// import java.io.IOException;

// public class AuthTokenFilter extends OncePerRequestFilter {

//     @Autowired
//     private JwtUtils jwtUtils;

//     @Autowired
//     private CustomUserDetailsService userDetailsService;

//     @Override
//     protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//             throws ServletException, IOException {
//         try {
//             // 1. Lấy "vé" (JWT) từ Header của Request
//             String jwt = parseJwt(request);

//             // 2. Nếu có vé và vé còn hạn/thật
//             if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                
//                 // 3. Đọc email từ vé
//                 String email = jwtUtils.getUserNameFromJwtToken(jwt);

//                 // 4. Lấy thông tin chi tiết User từ Database (để biết quyền Role)
//                 UserDetails userDetails = userDetailsService.loadUserByUsername(email);

//                 // 5. "Xác thực" cho User này trong hệ thống Spring Security
//                 UsernamePasswordAuthenticationToken authentication = 
//                     new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
//                 authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

//                 // 🚀 LƯU VÀO CONTEXT: Kể từ giây phút này, Spring Security biết User này là ai!
//                 SecurityContextHolder.getContext().setAuthentication(authentication);
//             }
//         } catch (Exception e) {
//             System.out.println("Không thể xác thực người dùng: " + e.getMessage());
//         }

//         // Cho phép Request đi tiếp đến Controller
//         filterChain.doFilter(request, response);
//     }

//     // Hàm phụ để "bóc tách" chuỗi JWT từ Header (Bearer <token>)
//     private String parseJwt(HttpServletRequest request) {
//         String headerAuth = request.getHeader("Authorization");

//         if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
//             return headerAuth.substring(7); // Cắt bỏ chữ "Bearer " để lấy Token
//         }
//         return null;
//     }
// }