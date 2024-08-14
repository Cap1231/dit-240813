export class ModalManager {
    constructor() {
        // アクション選択モーダル
        this.actionSelectionModal = document.getElementById('action-selection-modal');
        this.actionSelectionCancelBtn = this.actionSelectionModal.querySelector('.cancel-btn');
        this.actionSelectionNextBtn = this.actionSelectionModal.querySelector('.next-btn');
        // 部位番号登録モーダル
        this.partNumberModal = document.getElementById('part-number-modal');
        this.partNumberCancelBtn = this.partNumberModal.querySelector('.cancel-btn');
        this.partNumberRegisterBtn = this.partNumberModal.querySelector('.register-btn');
        // 遷移画面登録モーダル
        this.transitionScreenModal = document.getElementById('transition-screen-modal');
        this.transitionScreenCancelBtn = this.transitionScreenModal.querySelector('.cancel-btn');
        this.transitionScreenRegisterBtn = this.partNumberModal.querySelector('.register-btn');

        this.modals = document.querySelectorAll('.modal');
        this.rect = null; // 選択されている矩形の相対座標

        this.setupEventListeners();
    }

    setupEventListeners() {
        // アクション選択モーダル
        this.actionSelectionCancelBtn.addEventListener('click', () => this.closeModal(this.actionSelectionModal));
        this.actionSelectionNextBtn.addEventListener('click', () => this.handleNext());
        document.querySelectorAll('input[name="selection-type"]').forEach(input => {
            input.addEventListener('change', () => {
                if (document.querySelector('input[name="selection-type"]:checked')) {
                    this.actionSelectionNextBtn.disabled = false; // 選択されたら「次へ」ボタンを有効化
                }
            });
        });
        // 部位番号登録モーダル
        this.partNumberCancelBtn.addEventListener('click', () => this.closeModal(this.partNumberModal));
        this.partNumberRegisterBtn.addEventListener('click', () => this.registerPartNumber());
        const partNumberInput = document.getElementById('part-number-input');
        partNumberInput.addEventListener('input', () => {
            if (partNumberInput.value.trim() !== '') {
                this.partNumberRegisterBtn.disabled = false;
            }
        });
        // 遷移画面登録モーダル
        this.transitionScreenCancelBtn.addEventListener('click', () => this.closeModal(this.transitionScreenModal));
        this.transitionScreenRegisterBtn.addEventListener('click', () => this.registerTransitionScreen());
        const transitionScreenInput = document.getElementById('transition-screen-input');
        transitionScreenInput.addEventListener('input', () => {
            if (transitionScreenInput.value.trim() !== '') {
                this.transitionScreenRegisterBtn.disabled = false;
            }
        });
    }

    openModal(targetModal) {
        this.modals.forEach(modal => {
            if (modal === targetModal) {
                modal.style.display = 'block';
                modal.classList.remove('inactive');
            } else {
                modal.classList.add('inactive');
            }
        });
    }

    closeModal(targetModal) {
        targetModal.style.display = 'none';
        this.modals.forEach(modal => modal.classList.remove('inactive'));
    }

    // TODO: 名前要検討。Main的な役割。ActionSelectionModal.execute ?
    openActionSelectionModal(rect) {
        this.rect = rect;
        this.openModal(this.actionSelectionModal)
    }

    //
    // アクション選択モーダル
    //
    handleNext() {
        const selectionType= document.querySelector('input[name="selection-type"]:checked').value;
        if (selectionType === 'part-number') {
            // 部位番号登録モーダルを開く
            this.openPartNumberModal();
        } else if (selectionType === 'transition-screen') {
            // 遷移画面登録モーダルを開く
            this.openTransitionScreenModal();
        }
    }

    openPartNumberModal() {
        this.openModal(this.partNumberModal)
    }

    openTransitionScreenModal() {
        this.openModal(this.transitionScreenModal)
    }

    //
    // 部位番号登録モーダル
    //
    registerPartNumber() {
        console.log('registerPartNumber');
    }

    //
    // 遷移画面登録モーダル
    //
    registerTransitionScreen() {
        console.log('registerTransitionScreen');
    }
}
