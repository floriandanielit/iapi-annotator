/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package db;

import java.io.Serializable;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

/**
 *
 * @author Pier
 */
public class DBManager implements Serializable {

    private transient Connection conn;

    public DBManager(String dburl, String dbuser, String dbpass) throws SQLException, ClassNotFoundException {
        try {
            Class.forName("org.apache.derby.jdbc.EmbeddedDriver", true, getClass().getClassLoader());
        } catch (Exception e) {
            throw new RuntimeException(e.toString(), e);
        }
        Class.forName("com.mysql.jdbc.Driver");
        Connection con = DriverManager.getConnection(dburl, dbuser, dbpass);
        this.conn = con;
    }

    public static void shutdown() {
        try {
            DriverManager.getConnection("jdbc:derby:;shutdown=true");
        } catch (SQLException ex) {
            Logger.getLogger(DBManager.class.getName()).info(ex.getMessage());
        }
    }

    public List<Annotation> getAnnotations(String url) throws SQLException {
        
        List<Annotation> annotations = new ArrayList<Annotation>();

        PreparedStatement stm = conn.prepareStatement("SELECT * FROM annotations WHERE url =  ? ");

        try {

            stm.setString(1, url);
            ResultSet rs = stm.executeQuery();
            
            try {
                while (rs.next()) {
                    Annotation a = new Annotation();
                    
                    a.setCSSid(rs.getString("CSSid"));
                    a.setCSSpath(rs.getString("CSSpath"));
                    a.setiAPIvalue(rs.getString("iAPIvalue"));

                    annotations.add(a);
                }
            } finally {
                // ricordarsi SEMPRE di chiudere i ResultSet in un blocco 
                rs.close();
            }
        } finally { // ricordarsi SEMPRE di chiudere i PreparedStatement in 
            stm.close();
        }
        
        return annotations;
    }
    
    public void newAnnotation(String url, String CSSid, String CSSpath, String iAPIvalue) throws SQLException {
        PreparedStatement stm = conn.prepareStatement("INSERT INTO annotations (url, CSSid, CSSpath, iAPIvalue) VALUES(?,?,?,?)");

        try {
            stm.setString(1, url);
            stm.setString(2, CSSid);
            stm.setString(3, CSSpath);
            stm.setString(4, iAPIvalue);

            stm.executeUpdate();

        } finally {
            stm.close();
        }
    }
    
    public void removeAnnotations(String url, String id) throws SQLException {
        PreparedStatement stm = conn.prepareStatement("DELETE FROM annotations WHERE url = ? AND CSSid = ? ");

        try {
            stm.setString(1, url);
            stm.setString(2, id);

            stm.executeUpdate();

        } finally {
            stm.close();
        }
    }

}
