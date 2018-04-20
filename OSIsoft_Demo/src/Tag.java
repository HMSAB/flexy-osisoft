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

   String eWONTagName;
   String webID;

   TagControl tagControl;

   public Tag(String eWONname, String id) {
      eWONTagName = eWONname;
      webID = id;

      try {
         tagControl = new TagControl(eWONname);
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

   // Returns a string representation of the eWON's long value of the tag
   public String getTagValue() {
      return Long.toString(tagControl.getTagValueAsLong());
   }

}
