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
public class DataGet extends HttpServlet {

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
        
        List<Annotation> annotations = new ArrayList<Annotation>();
        
        //retrieve previous annotations relative to that url
        try {
            annotations = manager.getAnnotations(getValue(request.getPart("target_url")));
        } catch (SQLException ex) {
            Logger.getLogger(DataPush.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        if(annotations.isEmpty()) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        } else { 
        
            response.setContentType("text/xml;charset=UTF-8");;
            PrintWriter out = response.getWriter();
                out.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
                out.append("<annotations_list>");

                for (Iterator<Annotation> i = annotations.iterator(); i.hasNext();) {
                    Annotation a = i.next();

                    out.append("<annotation>");
                    out.append("<CSSid>").append(a.getCSSid()).append("</CSSid>");
                    out.append("<CSSpath>").append(a.getCSSpath()).append("</CSSpath>");            
                    out.append("<iAPIvalue>").append(a.getiAPIvalue()).append("</iAPIvalue>");
                    out.append("</annotation>");
                }

                out.append("</annotations_list>");
            
        }
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
        processRequest(request, response);
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
