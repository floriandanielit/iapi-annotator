/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package db;
import java.io.Serializable;
/**
 *
 * @author Pier
 */

public class Annotation {
    //private String url;
    private String CSSid;
    private String CSSpath;
    private String iAPIvalue;

    /*
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
    */
    
    public String getCSSid() {
        return CSSid;
    }

    public void setCSSid(String CSSid) {
        this.CSSid = CSSid;
    }

    public String getCSSpath() {
        return CSSpath;
    }

    public void setCSSpath(String CSSpath) {
        this.CSSpath = CSSpath;
    }

    public String getiAPIvalue() {
        return iAPIvalue;
    }

    public void setiAPIvalue(String iAPIvalue) {
        this.iAPIvalue = iAPIvalue;
    }
    
}
