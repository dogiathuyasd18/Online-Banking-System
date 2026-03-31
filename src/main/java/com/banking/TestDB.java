package com.banking;

import java.sql.Connection;
import java.sql.DriverManager;

public class TestDB {
    public static void main(String[] args) {
        // Your exact database URL
        // String url = "jdbc:mysql://localhost:3306/Banking?useSSL=false&serverTimezone=UTC";
        String url = "jdbc:mysql://localhost:3306/Banking?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC";
        String user = "root";
        String password = "dogiathuy1"; // Put your actual MySQL password here

        System.out.println("Attempting to connect to the database...");

        try {
            // Attempt the connection
            Connection connection = DriverManager.getConnection(url, user, password);
            System.out.println("✅ SUCCESS! Java is connected to the 'Banking' database.");
            connection.close();
        } catch (Exception e) {
            System.out.println("❌ FAILED to connect. Here is the exact reason:");
            e.printStackTrace();
        }
    }
}