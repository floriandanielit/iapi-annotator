/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package manipulate_data;

import db.Annotation;
import db.DBManager;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

/**
 *
 * @author Pier
 */

@MultipartConfig
public class DataPush extends HttpServlet {
    
    private DBManager manager;
    
    @Override
    public void init() throws ServletException {
        this.manager = (DBManager)super.getServletContext().getAttribute("dbmanager");
    }

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();
            /* TODO output your page here. You may use following sample code. */
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<title>Annotations submitted succesfully!</title>");            
            out.println("</head>");
            out.println("<body>");
            out.println("<h1>Annotations submitted succesfully!</h1>");

            out.println("<p>Detected URL of annotation: " + getValue(request.getPart("target_url")) + "</p>");
            
            out.println("</body>");
            out.println("</html>");
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        int count = 0;
        Boolean already_available = false;
        List<Annotation> annotations = new ArrayList<Annotation>();
        Set<String> ids = new TreeSet<String>();
        
        //retrieve previous annotations relative to that url
        try {
            annotations = manager.getAnnotations(getValue(request.getPart("target_url")));
        } catch (SQLException ex) {
            Logger.getLogger(DataPush.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        //for each path check in previous annotations if it is already present
        while(getValue(request.getPart("path_" + count)) != null && count < 1000) {
            String path = getValue(request.getPart(("path_" + count)));
            System.out.print(path);
            for (Iterator<Annotation> i = annotations.iterator(); i.hasNext();) {
                Annotation a = i.next();
                if (path.equals(a.getCSSpath())) {
                    already_available = true;
                    ids.add(a.getCSSid());
                }
            }
            count++;
        }
        
        // if the database contains old annotations relative to the same elements at that same url, remove them
        if (already_available) {
            System.out.print("about to remove old");
            for (Iterator<String> i = ids.iterator(); i.hasNext();) {
                String s = i.next();
                
                try {
                    manager.removeAnnotations(getValue(request.getPart("target_url")), s);
                } catch (SQLException ex) {
                    Logger.getLogger(DataPush.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        }
        
        // add the new annotations to the database
        count = 0;
        while (getValue(request.getPart("path_" + count)) != null && count < 1000) {
            try {
                manager.newAnnotation(getValue(request.getPart("target_url")), getValue(request.getPart("id_0")), getValue(request.getPart(("path_" + count))), getValue(request.getPart(("value_" + count))));
            } catch (SQLException ex) {
                Logger.getLogger(DataPush.class.getName()).log(Level.SEVERE, null, ex);
            }
            count++;
        }
        
        processRequest(request, response);
        
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
    
    private static String getValue(Part part) throws IOException {
        if (part != null) {
            BufferedReader reader = new BufferedReader(new InputStreamReader(part.getInputStream(), "UTF-8"));
            StringBuilder value = new StringBuilder();
            char[] buffer = new char[1024];
            for (int length = 0; (length = reader.read(buffer)) > 0;) {
                value.append(buffer, 0, length);
            }
            return value.toString();
        }
        return null;
    }

}
