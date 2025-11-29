// AWS Management Console Replica - Main JavaScript (Fixed)

class AWSConsole {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.currentPage = 'home';
        this.resources = {
            ec2Instances: [],
            s3Buckets: [],
            lambdaFunctions: [],
            rdsInstances: []
        };
        this.wizardData = {};
        this.currentWizardStep = 1;
        this.totalWizardSteps = 7;
        
        // Load AWS data
        this.awsData = {
            credentials: { username: "vijayrajeshr", password: "Vijay@123" },
            pricing: {
                ec2: {
                    on_demand: {
                        "t2.micro": {"hourly": 0.0116, "monthly": 8.50, "vcpu": 1, "memory_gb": 1, "free_tier": true},
                        "t2.small": {"hourly": 0.023, "monthly": 16.79, "vcpu": 1, "memory_gb": 2, "free_tier": false},
                        "t3.micro": {"hourly": 0.0104, "monthly": 7.59, "vcpu": 2, "memory_gb": 1, "free_tier": true},
                        "t3.small": {"hourly": 0.0208, "monthly": 15.18, "vcpu": 2, "memory_gb": 2, "free_tier": false},
                        "t3.medium": {"hourly": 0.0416, "monthly": 30.37, "vcpu": 2, "memory_gb": 4, "free_tier": false},
                        "m5.large": {"hourly": 0.096, "monthly": 70.08, "vcpu": 2, "memory_gb": 8, "free_tier": false},
                        "m5.xlarge": {"hourly": 0.192, "monthly": 140.16, "vcpu": 4, "memory_gb": 16, "free_tier": false},
                        "c5.large": {"hourly": 0.085, "monthly": 62.05, "vcpu": 2, "memory_gb": 4, "free_tier": false},
                        "r5.large": {"hourly": 0.126, "monthly": 91.98, "vcpu": 2, "memory_gb": 16, "free_tier": false}
                    }
                }
            },
            services: {
                "Compute": ["Amazon EC2", "AWS Lambda", "Amazon Elastic Beanstalk", "AWS Fargate", "Amazon Lightsail", "AWS Batch", "Amazon ECS", "Amazon EKS"],
                "Storage": ["Amazon S3", "Amazon EBS", "Amazon EFS", "Amazon FSx", "AWS Storage Gateway", "AWS Backup", "Amazon S3 Glacier"],
                "Database": ["Amazon RDS", "Amazon DynamoDB", "Amazon Redshift", "Amazon DocumentDB", "Amazon Neptune", "Amazon ElastiCache"],
                "Networking & Content Delivery": ["Amazon VPC", "Amazon CloudFront", "Amazon Route 53", "AWS Direct Connect", "AWS Global Accelerator", "Amazon API Gateway"],
                "Security, Identity & Compliance": ["AWS IAM", "Amazon Cognito", "AWS Single Sign-On", "Amazon GuardDuty", "AWS Security Hub", "AWS WAF", "AWS Shield"],
                "Developer Tools": ["AWS CodeCommit", "AWS CodeBuild", "AWS CodeDeploy", "AWS CodePipeline", "AWS Cloud9", "AWS X-Ray"],
                "Management & Governance": ["AWS CloudFormation", "AWS CloudWatch", "AWS Systems Manager", "AWS Config", "AWS CloudTrail", "AWS Trusted Advisor"],
                "Application Integration": ["Amazon SQS", "Amazon SNS", "AWS Step Functions", "Amazon EventBridge", "Amazon MQ", "AWS AppSync"]
            },
            amis: [
                {"id": "ami-0abcdef1234567890", "name": "Amazon Linux 2023", "description": "Amazon Linux 2023 AMI", "architecture": "x86_64", "free_tier": true},
                {"id": "ami-0987654321098765a", "name": "Ubuntu Server 22.04 LTS", "description": "Canonical, Ubuntu, 22.04 LTS", "architecture": "x86_64", "free_tier": true},
                {"id": "ami-0fedcba0987654321", "name": "Windows Server 2022", "description": "Microsoft Windows Server 2022", "architecture": "x86_64", "free_tier": false}
            ]
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Navigation links - Fixed event delegation
        document.addEventListener('click', (e) => {
            // Navigation links
            if (e.target.matches('[data-page]')) {
                e.preventDefault();
                this.navigateTo(e.target.dataset.page);
                return;
            }
            
            // Quick actions
            if (e.target.matches('[data-action]') || e.target.closest('[data-action]')) {
                e.preventDefault();
                const actionElement = e.target.matches('[data-action]') ? e.target : e.target.closest('[data-action]');
                this.handleQuickAction(actionElement.dataset.action);
                return;
            }

            // Service links
            if (e.target.matches('[data-service]')) {
                e.preventDefault();
                this.openService(e.target.dataset.service);
                return;
            }

            // AMI selection
            if (e.target.closest('.ami-item')) {
                this.selectAMI(e.target.closest('.ami-item'));
                return;
            }

            // Instance type selection
            if (e.target.closest('.instance-type')) {
                this.selectInstanceType(e.target.closest('.instance-type'));
                return;
            }

            // Remove tag button
            if (e.target.matches('.remove-tag')) {
                e.target.closest('tr').remove();
                return;
            }

            // Modal close buttons - Fixed
            if (e.target.matches('.modal-close') || e.target.matches('.wizard-close')) {
                const modal = e.target.closest('.modal-overlay, .wizard-overlay');
                if (modal) {
                    this.closeModal(modal);
                }
                return;
            }

            // Close modal when clicking overlay (but not the modal content)
            if (e.target.matches('.modal-overlay, .wizard-overlay')) {
                this.closeModal(e.target);
                return;
            }
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Launch instance button
        const launchBtn = document.getElementById('launch-instance-btn');
        if (launchBtn) {
            launchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLaunchWizard();
            });
        }

        // Wizard controls - Fixed
        this.setupWizardEventListeners();

        // Service search
        const serviceSearch = document.getElementById('service-search');
        if (serviceSearch) {
            serviceSearch.addEventListener('input', (e) => this.filterServices(e.target.value));
        }

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-overlay:not(.hidden), .wizard-overlay:not(.hidden)');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    setupWizardEventListeners() {
        // Navigation buttons - Fixed
        const prevBtn = document.getElementById('wizard-prev');
        const nextBtn = document.getElementById('wizard-next');
        const launchBtn = document.getElementById('wizard-launch');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.previousWizardStep();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextWizardStep();
            });
        }
        
        if (launchBtn) {
            launchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showKeyPairModal();
            });
        }

        // Add tag button
        const addTagBtn = document.getElementById('add-tag');
        if (addTagBtn) {
            addTagBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addTag();
            });
        }

        // Key pair modal confirm button
        const confirmLaunch = document.getElementById('confirm-launch');
        if (confirmLaunch) {
            confirmLaunch.addEventListener('click', (e) => {
                e.preventDefault();
                this.launchInstance();
            });
        }
    }

    checkAuthentication() {
        // Check if user is already authenticated (session-based)
        const isLoggedIn = sessionStorage.getItem('aws_authenticated');
        if (isLoggedIn) {
            this.isAuthenticated = true;
            this.currentUser = sessionStorage.getItem('aws_username');
            this.showConsole();
            this.loadStoredResources();
        } else {
            this.showLogin();
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');

        if (username === this.awsData.credentials.username && 
            password === this.awsData.credentials.password) {
            this.isAuthenticated = true;
            this.currentUser = username;
            sessionStorage.setItem('aws_authenticated', 'true');
            sessionStorage.setItem('aws_username', username);
            this.showConsole();
            errorDiv.classList.add('hidden');
        } else {
            errorDiv.textContent = 'Invalid username or password. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.resources = { ec2Instances: [], s3Buckets: [], lambdaFunctions: [], rdsInstances: [] };
        sessionStorage.clear();
        this.showLogin();
    }

    showLogin() {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('console-app').classList.add('hidden');
    }

    showConsole() {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('console-app').classList.remove('hidden');
        this.navigateTo('home');
        this.updateResourceCounts();
        this.populateServicesGrid();
    }

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.console-page').forEach(p => p.classList.add('hidden'));
        
        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        this.currentPage = page;

        // Load page-specific content
        if (page === 'home') {
            this.updateResourceCounts();
        } else if (page === 'services') {
            this.populateServicesGrid();
        } else if (page === 'ec2') {
            this.loadEC2Dashboard();
        } else if (page === 'billing') {
            this.loadBillingDashboard();
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'launch-ec2':
                this.navigateTo('ec2');
                setTimeout(() => this.openLaunchWizard(), 100);
                break;
            case 'create-s3':
                this.createS3Bucket();
                break;
            case 'create-lambda':
                this.createLambdaFunction();
                break;
            case 'view-billing':
                this.navigateTo('billing');
                break;
        }
    }

    updateResourceCounts() {
        const ec2Count = document.getElementById('ec2-count');
        const s3Count = document.getElementById('s3-count');
        const lambdaCount = document.getElementById('lambda-count');
        const monthlyCost = document.getElementById('monthly-cost');

        if (ec2Count) ec2Count.textContent = this.resources.ec2Instances.filter(i => i.state === 'running').length;
        if (s3Count) s3Count.textContent = this.resources.s3Buckets.length;
        if (lambdaCount) lambdaCount.textContent = this.resources.lambdaFunctions.length;
        
        const cost = this.calculateMonthlyCost();
        if (monthlyCost) monthlyCost.textContent = `$${cost.toFixed(2)}`;
    }

    calculateMonthlyCost() {
        let total = 0;
        this.resources.ec2Instances.forEach(instance => {
            if (instance.state === 'running') {
                const pricing = this.awsData.pricing.ec2.on_demand[instance.instanceType];
                if (pricing) {
                    total += pricing.monthly;
                }
            }
        });
        return total;
    }

    populateServicesGrid() {
        const servicesGrid = document.getElementById('services-grid');
        if (!servicesGrid) return;

        servicesGrid.innerHTML = '';

        Object.entries(this.awsData.services).forEach(([category, services]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'service-category';
            
            categoryDiv.innerHTML = `
                <h3>${category}</h3>
                <div class="service-list">
                    ${services.map(service => `
                        <a href="#" class="service-item" data-service="${service}">
                            ${service}
                        </a>
                    `).join('')}
                </div>
            `;
            
            servicesGrid.appendChild(categoryDiv);
        });
    }

    openService(serviceName) {
        if (serviceName === 'Amazon EC2') {
            this.navigateTo('ec2');
        } else {
            // For demonstration, show a simple alert for other services
            alert(`${serviceName} dashboard would open here. This is a demo version.`);
        }
    }

    filterServices(query) {
        const serviceItems = document.querySelectorAll('.service-item');
        serviceItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
            
            if (matches && query) {
                item.innerHTML = item.textContent.replace(
                    new RegExp(query, 'gi'), 
                    match => `<span class="search-highlight">${match}</span>`
                );
            } else {
                item.innerHTML = item.textContent;
            }
        });

        // Hide/show categories based on visible services
        document.querySelectorAll('.service-category').forEach(category => {
            const visibleServices = category.querySelectorAll('.service-item[style="display: block"], .service-item:not([style])');
            category.style.display = visibleServices.length > 0 ? 'block' : 'none';
        });
    }

    loadEC2Dashboard() {
        const tbody = document.getElementById('instances-tbody');
        if (!tbody) return;

        if (this.resources.ec2Instances.length === 0) {
            tbody.innerHTML = '<tr class="no-instances"><td colspan="5">No instances found. Launch your first instance!</td></tr>';
        } else {
            tbody.innerHTML = this.resources.ec2Instances.map(instance => `
                <tr>
                    <td>${instance.id}</td>
                    <td>${instance.name || '-'}</td>
                    <td>${instance.instanceType}</td>
                    <td>
                        <span class="instance-state state-${instance.state}">
                            <span class="status-icon status-${instance.state}"></span>
                            ${instance.state}
                        </span>
                    </td>
                    <td>
                        <div class="instance-actions">
                            <button class="btn btn--outline btn--sm" onclick="awsConsole.toggleInstance('${instance.id}')">
                                ${instance.state === 'running' ? 'Stop' : 'Start'}
                            </button>
                            <button class="btn btn--outline btn--sm" onclick="awsConsole.terminateInstance('${instance.id}')">
                                Terminate
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    openLaunchWizard() {
        this.resetWizard();
        const wizard = document.getElementById('launch-wizard');
        if (wizard) {
            wizard.classList.remove('hidden');
            this.setupWizardStep1();
        }
    }

    closeLaunchWizard() {
        const wizard = document.getElementById('launch-wizard');
        if (wizard) {
            wizard.classList.add('hidden');
        }
        this.resetWizard();
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
            if (modal.id === 'launch-wizard') {
                this.resetWizard();
            }
        }
    }

    resetWizard() {
        this.currentWizardStep = 1;
        this.wizardData = {};
        
        // Reset step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index === 0) step.classList.add('active');
        });

        // Show first step
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            step.classList.toggle('hidden', index !== 0);
            step.classList.toggle('active', index === 0);
        });

        // Reset buttons
        const prevBtn = document.getElementById('wizard-prev');
        const nextBtn = document.getElementById('wizard-next');
        const launchBtn = document.getElementById('wizard-launch');

        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.classList.remove('hidden');
        if (launchBtn) launchBtn.classList.add('hidden');
    }

    setupWizardStep1() {
        const amiList = document.getElementById('ami-list');
        if (!amiList) return;

        amiList.innerHTML = this.awsData.amis.map(ami => `
            <div class="ami-item" data-ami-id="${ami.id}">
                <input type="radio" name="ami" value="${ami.id}" id="ami-${ami.id}">
                <div class="ami-info">
                    <div class="ami-name">${ami.name}</div>
                    <div class="ami-description">${ami.description}</div>
                    <div class="ami-badges">
                        ${ami.free_tier ? '<span class="ami-badge">Free tier eligible</span>' : ''}
                        <span class="ami-badge">${ami.architecture}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    selectAMI(amiElement) {
        document.querySelectorAll('.ami-item').forEach(item => item.classList.remove('selected'));
        amiElement.classList.add('selected');
        const radio = amiElement.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
            this.wizardData.ami = radio.value;
        }
    }

    nextWizardStep() {
        if (this.currentWizardStep < this.totalWizardSteps) {
            // Validate current step
            if (!this.validateWizardStep(this.currentWizardStep)) {
                return;
            }

            // Move to next step
            this.currentWizardStep++;
            this.updateWizardUI();

            // Setup specific step content
            if (this.currentWizardStep === 2) {
                this.setupWizardStep2();
            } else if (this.currentWizardStep === 7) {
                this.setupWizardStep7();
            }
        }
    }

    previousWizardStep() {
        if (this.currentWizardStep > 1) {
            this.currentWizardStep--;
            this.updateWizardUI();
        }
    }

    updateWizardUI() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum < this.currentWizardStep) {
                step.classList.add('completed');
            } else if (stepNum === this.currentWizardStep) {
                step.classList.add('active');
            }
        });

        // Show/hide wizard steps
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.toggle('hidden', stepNum !== this.currentWizardStep);
            step.classList.toggle('active', stepNum === this.currentWizardStep);
        });

        // Update buttons
        const prevBtn = document.getElementById('wizard-prev');
        const nextBtn = document.getElementById('wizard-next');
        const launchBtn = document.getElementById('wizard-launch');

        if (prevBtn) prevBtn.disabled = this.currentWizardStep === 1;
        
        if (this.currentWizardStep === this.totalWizardSteps) {
            if (nextBtn) nextBtn.classList.add('hidden');
            if (launchBtn) launchBtn.classList.remove('hidden');
        } else {
            if (nextBtn) nextBtn.classList.remove('hidden');
            if (launchBtn) launchBtn.classList.add('hidden');
        }
    }

    validateWizardStep(step) {
        switch (step) {
            case 1:
                if (!this.wizardData.ami) {
                    alert('Please select an AMI');
                    return false;
                }
                break;
            case 2:
                if (!this.wizardData.instanceType) {
                    alert('Please select an instance type');
                    return false;
                }
                break;
        }
        return true;
    }

    setupWizardStep2() {
        const instanceTypes = document.getElementById('instance-types');
        if (!instanceTypes) return;

        instanceTypes.innerHTML = Object.entries(this.awsData.pricing.ec2.on_demand).map(([type, specs]) => `
            <div class="instance-type" data-instance-type="${type}">
                <input type="radio" name="instance-type" value="${type}" id="type-${type}">
                <div class="instance-type-info">
                    <div class="instance-type-name">${type}</div>
                    <div class="instance-type-specs">
                        <span>${specs.vcpu} vCPU</span>
                        <span>${specs.memory_gb} GB Memory</span>
                        ${specs.free_tier ? '<span style="color: var(--color-success)">Free tier eligible</span>' : ''}
                    </div>
                </div>
                <div class="instance-type-pricing">
                    <div class="price-hourly">$${specs.hourly}/hour</div>
                    <div class="price-monthly">~$${specs.monthly}/month</div>
                </div>
            </div>
        `).join('');
    }

    selectInstanceType(typeElement) {
        document.querySelectorAll('.instance-type').forEach(item => item.classList.remove('selected'));
        typeElement.classList.add('selected');
        const radio = typeElement.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
            this.wizardData.instanceType = radio.value;
        }
    }

    setupWizardStep7() {
        const reviewSection = document.getElementById('review-section');
        const costEstimate = document.getElementById('cost-estimate');
        
        if (!reviewSection || !costEstimate) return;

        const selectedAMI = this.awsData.amis.find(ami => ami.id === this.wizardData.ami);
        const selectedInstanceType = this.awsData.pricing.ec2.on_demand[this.wizardData.instanceType];

        if (selectedAMI && selectedInstanceType) {
            reviewSection.innerHTML = `
                <div class="review-item">
                    <h4>AMI</h4>
                    <p><strong>${selectedAMI.name}</strong></p>
                    <p>${selectedAMI.description}</p>
                </div>
                <div class="review-item">
                    <h4>Instance Type</h4>
                    <p><strong>${this.wizardData.instanceType}</strong></p>
                    <p>${selectedInstanceType.vcpu} vCPU, ${selectedInstanceType.memory_gb} GB RAM</p>
                </div>
                <div class="review-item">
                    <h4>Security Group</h4>
                    <p><strong>launch-wizard-sg</strong></p>
                    <p>SSH (port 22) from 0.0.0.0/0</p>
                </div>
            `;

            costEstimate.textContent = `$${selectedInstanceType.hourly}/hour (~$${selectedInstanceType.monthly}/month)`;
        }
    }

    addTag() {
        const tbody = document.querySelector('#tags-table tbody');
        if (!tbody) return;
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="form-control" placeholder="Key"></td>
            <td><input type="text" class="form-control" placeholder="Value"></td>
            <td><button type="button" class="btn btn--outline btn--sm remove-tag">Remove</button></td>
        `;
        tbody.appendChild(newRow);
    }

    showKeyPairModal() {
        const modal = document.getElementById('key-pair-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    launchInstance() {
        // Create new instance
        const newInstance = {
            id: `i-${Math.random().toString(36).substr(2, 17)}`,
            name: 'My Instance',
            instanceType: this.wizardData.instanceType,
            ami: this.wizardData.ami,
            state: 'pending',
            launchTime: new Date()
        };

        this.resources.ec2Instances.push(newInstance);
        this.saveResources();

        // Simulate instance starting
        setTimeout(() => {
            newInstance.state = 'running';
            this.saveResources();
            this.updateResourceCounts();
            if (this.currentPage === 'ec2') {
                this.loadEC2Dashboard();
            }
        }, 3000);

        // Close modals and wizard
        this.closeModal(document.getElementById('key-pair-modal'));
        this.closeLaunchWizard();

        // Navigate to EC2 dashboard
        this.navigateTo('ec2');
        this.updateResourceCounts();
        this.loadEC2Dashboard();

        alert('Instance launch initiated! Your instance will be available shortly.');
    }

    toggleInstance(instanceId) {
        const instance = this.resources.ec2Instances.find(i => i.id === instanceId);
        if (!instance) return;

        if (instance.state === 'running') {
            instance.state = 'stopped';
        } else if (instance.state === 'stopped') {
            instance.state = 'pending';
            setTimeout(() => {
                instance.state = 'running';
                this.saveResources();
                this.updateResourceCounts();
                if (this.currentPage === 'ec2') {
                    this.loadEC2Dashboard();
                }
            }, 2000);
        }

        this.saveResources();
        this.updateResourceCounts();
        this.loadEC2Dashboard();
    }

    terminateInstance(instanceId) {
        if (confirm('Are you sure you want to terminate this instance? This action cannot be undone.')) {
            this.resources.ec2Instances = this.resources.ec2Instances.filter(i => i.id !== instanceId);
            this.saveResources();
            this.updateResourceCounts();
            this.loadEC2Dashboard();
        }
    }

    createS3Bucket() {
        const bucketName = prompt('Enter S3 bucket name:');
        if (bucketName) {
            const newBucket = {
                name: bucketName,
                region: 'us-east-1',
                created: new Date()
            };
            this.resources.s3Buckets.push(newBucket);
            this.saveResources();
            this.updateResourceCounts();
            alert(`S3 bucket "${bucketName}" created successfully!`);
        }
    }

    createLambdaFunction() {
        const functionName = prompt('Enter Lambda function name:');
        if (functionName) {
            const newFunction = {
                name: functionName,
                runtime: 'python3.9',
                created: new Date()
            };
            this.resources.lambdaFunctions.push(newFunction);
            this.saveResources();
            this.updateResourceCounts();
            alert(`Lambda function "${functionName}" created successfully!`);
        }
    }

    loadBillingDashboard() {
        const mtdCost = this.calculateMonthlyCost();
        const forecasted = mtdCost * 1.2; // Simple forecasting

        const mtdCostEl = document.getElementById('mtd-cost');
        const forecastedCostEl = document.getElementById('forecasted-cost');

        if (mtdCostEl) mtdCostEl.textContent = `$${mtdCost.toFixed(2)}`;
        if (forecastedCostEl) forecastedCostEl.textContent = `$${forecasted.toFixed(2)}`;

        // Simple service costs chart simulation
        const chartContainer = document.getElementById('service-costs-chart');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div style="text-align: center; color: var(--color-text-secondary);">
                    <p>Service Cost Breakdown</p>
                    <div style="margin-top: 20px;">
                        <div>EC2: $${mtdCost.toFixed(2)} (${((mtdCost / Math.max(mtdCost, 0.01)) * 100).toFixed(1)}%)</div>
                        <div>S3: $0.00 (0%)</div>
                        <div>Lambda: $0.00 (0%)</div>
                    </div>
                </div>
            `;
        }
    }

    saveResources() {
        sessionStorage.setItem('aws_resources', JSON.stringify(this.resources));
    }

    loadStoredResources() {
        const stored = sessionStorage.getItem('aws_resources');
        if (stored) {
            try {
                this.resources = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading stored resources:', e);
                this.resources = { ec2Instances: [], s3Buckets: [], lambdaFunctions: [], rdsInstances: [] };
            }
        }
    }
}

// Initialize the AWS Console
const awsConsole = new AWSConsole();

// Handle page visibility change to simulate session timeout
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, could implement session timeout logic here
    }
});

// Handle beforeunload to clean up session data
window.addEventListener('beforeunload', () => {
    // Session data will persist until browser/tab is closed
    // This simulates AWS console behavior
});

// Expose console instance globally for debugging and inline event handlers
window.awsConsole = awsConsole;