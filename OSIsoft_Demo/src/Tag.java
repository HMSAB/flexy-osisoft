import com.ewon.ewonitf.EWException;
import com.ewon.ewonitf.TagControl;

/**
 * Tag class
 * 
 * Class object for a Tag. Stores the eWON tag name and the OSIsoft PI webId of
 * attribute.
 * 
 * HMS Industrial Networks Inc. Solution Center
 * 
 * @author thk
 *
 */

public class Tag {

   private String eWONTagName;
   private String webID;

   private TagControl tagControl;
   
   public Tag(String tagName) {
      eWONTagName = tagName;
      
      try {
         tagControl = new TagControl(tagName);
      } catch (EWException e) {
         e.printStackTrace();
      }
   }

   public Tag(String tagName, String id) {
      eWONTagName = tagName;
      webID = id;

      try {
         tagControl = new TagControl(tagName);
      } catch (EWException e) {
         e.printStackTrace();
      }
   }

   // Returns the eWON tag name
   public String getTagName() {
      return eWONTagName;
   }

   // Returns the OSIsoft webId
   public String getWebID() {
      return webID;
   }
   
   // Sets the OSIsoft webID
   public void setWebID(String newWebID) {
      webID = newWebID;
   }

   // Returns a string representation of the eWON's long value of the tag
   public String getTagValue() {
      return Long.toString(tagControl.getTagValueAsLong());
   }

}
