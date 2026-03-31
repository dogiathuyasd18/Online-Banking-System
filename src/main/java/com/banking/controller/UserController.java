package com.banking.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.banking.dto.UserLoginDTO;
import com.banking.dto.UserRegistrationDTO;
import com.banking.dto.UserResponseDTO;
import com.banking.entity.User;
import com.banking.service.UserService;

import jakarta.validation.Valid;

@RestController // Đánh dấu đây là một API
@RequestMapping("/api/users") // Tất cả các đường dẫn sẽ bắt đầu bằng /api/users
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody UserRegistrationDTO dto) {
        // 1. Nhận DTO từ Request Body
        // 2. @Valid sẽ tự động kiểm tra các @NotBlank, @Email trong DTO
        // 3. Gọi Service để xử lý logic
        User savedUser = userService.registerUser(dto);

        // 4. Trả về mã 201 Created và thông tin User vừa tạo
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // @PostMapping("/login")
    // public ResponseEntity<String> login(@Valid @RequestBody UserLoginDTO
    // loginDTO) {
    // try {
    // // Gọi Service để kiểm tra đăng nhập
    // UserResponseDTO isSuccess = userService.loginUser(loginDTO);

    // // Nếu thành công (isSuccess = true)
    // return ResponseEntity.ok("Đăng nhập thành công! Chào mừng bạn quay trở
    // lại.");
    // } catch (Exception e) {
    // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    // }
    // }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginDTO loginDTO) {
        try {
            // 1. Gọi Service và hứng lấy đối tượng UserResponseDTO (chứa cả Account)
            UserResponseDTO response = userService.loginUser(loginDTO);

            // 2. Trả về đối tượng này. Spring Boot sẽ tự động biến nó thành JSON.
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // Nếu sai email/pass, vẫn trả về lỗi 401 như cũ
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
