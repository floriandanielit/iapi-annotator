package listeners;

import db.DBManager;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
/**
 *
 * @author FEDE
 */
public class WebappContextListener implements
ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        String dburl =sce.getServletContext().getInitParameter("dburl");
        String dbuser =sce.getServletContext().getInitParameter("dbuser");
        String dbpass =sce.getServletContext().getInitParameter("dbpass");
        try {
            DBManager manager = new DBManager(dburl, dbuser, dbpass);
            sce.getServletContext().setAttribute("dbmanager", manager);//pubblico l'attributo per il context
        } catch (SQLException ex) {
            Logger.getLogger(getClass().getName()).severe(ex.toString());
            throw new RuntimeException(ex);
        } catch (ClassNotFoundException ex) {
            Logger.getLogger(WebappContextListener.class.getName()).log(Level.SEVERE, null, ex);
        }
}
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // Il database Derby deve essere "spento" tentando di connettersi al database con shutdown=true
        DBManager.shutdown();
    }
}