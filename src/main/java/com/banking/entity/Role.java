package com.banking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="Roles")
public class Role {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="role_id")
    private int roleId;

    @Column(name="role_name", length=50, nullable=false, unique=true)
    private String roleName;

    public Role(){}

    public Role(String roleName){
        this.roleName=roleName;
    }

    public int getRoleId(){return roleId;}
    public void setRoleId(int roleId){this.roleId=roleId;}


    public String getRoleName(){return roleName;}
    public void setRoleName(String roleName){this.roleName=roleName;}
}
