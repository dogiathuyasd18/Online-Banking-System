package com.banking.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class AuthTokenFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. Trích xuất JWT từ Header Authorization
            String jwt = parseJwt(request);

            // 2. Kiểm tra vé (Dùng hàm validateJwtToken bạn đã viết)
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                
                // 3. Đọc vé lấy Email (Dùng hàm getUserNameFromJwtToken bạn đã viết)
                String email = jwtUtils.getUserNameFromJwtToken(jwt);

                // 4. Tra cứu "Sổ hộ khẩu" để lấy thông tin chi tiết User
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // 5. Tạo "Chứng minh thư" tạm thời cho Request này
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Đưa vào hệ thống để các tầng sau biết User này đã được xác thực
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Không thể xác thực người dùng: {}", e.getMessage());
        }

        // 7. Cho phép Request đi tiếp (Đừng bao giờ quên dòng này!)
        filterChain.doFilter(request, response);
    }

    // Hàm bổ trợ để bóc tách chuỗi Token từ Header "Bearer <token>"
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}