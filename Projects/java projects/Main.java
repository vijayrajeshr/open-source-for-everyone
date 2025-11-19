/**
 * The Main class demonstrates how to use a constructor
 * to initialize a class attribute in Java.
 */
public class Main {

    /**
     * Class attribute representing a number.
     */
    private final int x;

    /**
     * Constructor for the Main class.
     * Initializes the attribute {@code x} to 5.
     */
    public Main() {
        x = 5;
    }

    /**
     * The main method is the entry point of the program.
     * It creates an instance of the {@link Main} class and
     * prints the value of {@code x} to the console.
     *
     * @param args Command-line arguments (not used in this program).
     */
    public static void main(String[] args) {
        Main myObj = new Main(); // Create an object of class Main
        System.out.println(myObj.x); // Print the value of x
    }
}
