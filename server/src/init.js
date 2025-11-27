// server/src/init.js
import pool from "./config/db.js";
import UserModel from "./models/UserModel.js";
import UserService from "./services/UserService.js";

class AppInitializer {
  constructor() {
    this.isInitialized = false;
    this.services = {};
  }

  async initialize() {
    if (this.isInitialized) {
      console.log('✅ Application déjà initialisée');
      return this.services;
    }

    console.log('🚀 Démarrage de l\'initialisation...');

    // Étape 1: Initialiser la base de données
    await this._initializeDatabase();
    
    // Étape 2: Initialiser les modèles
    await this._initializeModels();
    
    // Étape 3: Initialiser les services
    await this._initializeServices();

    this.isInitialized = true;
    console.log('🎉 Application complètement initialisée');
    
    return this.services;
  }

  async _initializeDatabase() {
    console.log('🔗 Initialisation base de données...');
    
    let retries = 5;
    while (retries > 0) {
      try {
        const connection = await pool.getConnection();
        connection.release();
        console.log('✅ Base de données connectée');
        return;
      } catch (error) {
        retries--;
        console.log(`⏳ Attente DB... (${5 - retries}/5)`);
        if (retries === 0) {
          throw new Error(`Impossible de se connecter à la DB: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async _initializeModels() {
    console.log('📊 Initialisation modèles...');
    
    // Initialiser UserModel avec le pool
    if (typeof UserModel.initialize === 'function') {
      await UserModel.initialize(pool);
    }
    
    console.log('✅ Modèles initialisés');
  }

  async _initializeServices() {
    console.log('⚙️ Initialisation services...');
    
    // Initialiser UserService avec UserModel
    if (typeof UserService.initialize === 'function') {
      await UserService.initialize(UserModel);
    }
    
    this.services.UserService = UserService;
    console.log('✅ Services initialisés');
  }

  getService(serviceName) {
    if (!this.isInitialized) {
      throw new Error('Application non initialisée. Appelez initialize() d\'abord.');
    }
    return this.services[serviceName];
  }
}

// Singleton global
const appInitializer = new AppInitializer();
export default appInitializer;