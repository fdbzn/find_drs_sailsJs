/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/
    /*'/home': {
        controller: 'HomeController',
        action: 'index'
    },*/
    // --- health center controller
    /*
    '/': {
        view: 'homepage',
        locals: {
            layout: false
        }
    },
    */


    /***************************************************************************
     *                                                                          *
     * Custom routes here...                                                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the custom routes above, it   *
     * is matched against Sails route blueprints. See `config/blueprints.js`    *
     * for configuration options and examples.                                  *
     *                                                                          *
     ***************************************************************************/
    '/': {
        controller: 'WelcomeController',
        action: 'index'
    },


    '/login': {
        controller: 'AuthController',
        action: 'login'
    },
    '/logout': {
        controller: 'AuthController',
        action: 'logout'
    },


    '/get_user_profile': {
        controller: 'AuthController',
        action: 'get_user_profile'
    },
    '/add_comment_hc': {
        controller: 'CommentHCenterController',
        action: 'addCommentHCenter'
    },
    '/more_hc_comments': {
        controller: 'CommentHCenterController',
        action: 'get_more_comments'
    },
    '/in_response_comment_hc': {
        controller: 'CommentHCenterController',
        action: 'addInResponseCommentHCenter'
    },


    // --- doctor comments
    '/add_comment_doctor': {
        controller: 'CommentDoctorController',
        action: 'addCommentDoctor'
    },
    '/doctor_profile/*': {
        controller: 'DoctorController',
        action: 'profile'
    },
    '/get_doctor_profile/:doctor_id': {
        controller: 'DoctorController',
        action: 'get_doctor_by_id'
    },


    '/add_hcenter_doctor': {
        controller: 'HealthCenterController',
        action: 'process_new_hc_doctor'
    },

    '/health_center_detail/*': {
        controller: 'HealthCenterController',
        action: 'health_center_detail'
    },


    '/recomendacion':{
        controller: 'HealthCenterController',
        action: 'create_health_center'
    },


    '/politicas': {
        view: 'statics/politicas'
    },
    '/terminos': {
        view: 'statics/terminos'
    },
    '/contacto': {
        view: 'statics/contacto'
    },
};
