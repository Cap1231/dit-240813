export class ModalManager {
    constructor() {
        this.actionStartModal = document.getElementById('actionStartModal'); // モーダルのコンテナ
        this.actionStartCancelButton = this.actionStartModal.querySelector('.cancelButton');
        this.nextButton = this.actionStartModal.querySelector('.nextButton');

        this.partNumberModal = document.getElementById('partNumberModal');
        this.partNumberModalCancelButton = this.partNumberModal.querySelector('.cancelButton');
        this.transitionScreenModal = document.getElementById('transitionScreenModal');
        this.transitionScreenModalCancelButton = this.transitionScreenModal.querySelector('.cancelButton');

        // TODO:  他のModalが利用できないように
        // this.modals = document.querySelectorAll('.modal');

        this.rect = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('input[name="registrationType"]').forEach(input => {
            input.addEventListener('change', () => {
                if (document.querySelector('input[name="registrationType"]:checked')) {
                    this.nextButton.disabled = false; // 選択されたら「次へ」ボタンを有効化
                }
            });
        });

        this.nextButton.addEventListener('click', () => this.handleNext());
        this.actionStartCancelButton.addEventListener('click', () => this.closeModal(this.actionStartModal));
        this.partNumberModalCancelButton.addEventListener('click', () => this.closeModal(this.partNumberModal));
        this.transitionScreenModalCancelButton.addEventListener('click', () => this.closeModal(this.transitionScreenModal));
    }

    openModal(targetModal) {
        targetModal.style.display = 'block';
        // TODO:  他のModalが利用できないように
        // this.modals.forEach(modal => {
        //     if (modal === targetModal) {
        //         modal.style.display = 'block';
        //         modal.classList.remove('inactive');
        //     } else {
        //         modal.classList.add('inactive');
        //     }
        // });
    }

    closeModal(targetModal) {
        targetModal.style.display = 'none';
        // TODO:  他のModalが利用できないように
        // this.modals.forEach(modal => modal.classList.remove('inactive'));
    }

    openActionStartModal(rect) {
        this.rect = rect;
        this.openModal(this.actionStartModal)
    }

    handleNext() {
        const selectedOption = document.querySelector('input[name="registrationType"]:checked').value;
        if (selectedOption === 'partNumber') {
            // 部位番号登録モーダルを開く
            this.openPartNumberModal();
        } else if (selectedOption === 'transitionScreen') {
            // 遷移画面登録モーダルを開く
            this.openTransitionScreenModal();
        }
    }

    openPartNumberModal() {
        console.log('Opening Part Number Registration Modal');
        this.openModal(this.partNumberModal)
    }

    openTransitionScreenModal() {
        console.log('Opening Transition Screen Registration Modal');
        this.openModal(this.transitionScreenModal)
    }
}
