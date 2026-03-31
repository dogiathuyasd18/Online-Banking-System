package com.banking.config;

import java.security.Key;
import java.util.Date;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {

    // 1. Chuỗi bí mật (Secret Key) - Dùng để "ký tên" lên vé. 
    // Trong thực tế tại Vulcanlab, chuỗi này phải cực kỳ dài và để trong file properties.
    private String jwtSecret = "ChuoiBiMatNayPhaiCucKyDaiDeDamBaoAnToanHeThongNganHang2026";
    
    // 2. Thời hạn của vé (Ví dụ: 24 giờ = 86400000 ms)
    private int jwtExpirationMs = 86400000;

    // Hàm tạo Key từ chuỗi bí mật
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // 🎫 HÀM 1: TẠO VÉ (Generate Token)
    // Sau khi User đăng nhập đúng, gọi hàm này để in vé đưa cho họ.
    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername())) // Lưu Email/Username vào vé
                .setIssuedAt(new Date()) // Ngày phát hành
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Ngày hết hạn
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Ký tên bằng thuật toán HS256
                .compact();
    }

    // 🔍 HÀM 2: ĐỌC VÉ (Get Username from Token)
    // Khi User gửi vé lên để rút tiền, dùng hàm này để biết chủ nhân cái vé là ai.
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // ✅ HÀM 3: KIỂM TRA VÉ (Validate Token)
    // Kiểm tra xem vé có bị làm giả, bị rách (sai định dạng) hoặc hết hạn hay không.
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            System.out.println("Vé không đúng định dạng!");
        } catch (ExpiredJwtException e) {
            System.out.println("Vé đã hết hạn!");
        } catch (UnsupportedJwtException e) {
            System.out.println("Vé không được hỗ trợ!");
        } catch (IllegalArgumentException e) {
            System.out.println("Chuỗi vé bị trống!");
        }
        return false;
    }
}
