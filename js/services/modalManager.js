export class ModalManager {
    constructor() {
        // アクション選択モーダル
        this.actionSelectionModal = document.getElementById('action-selection-modal');
        this.actionSelectionCancelBtn = this.actionSelectionModal.querySelector('.cancel-btn');
        this.actionSelectionNextBtn = this.actionSelectionModal.querySelector('.next-btn');
        // 部位番号登録モーダル
        this.partNumberModal = document.getElementById('part-number-modal');
        this.partNumberModalCancelBtn = this.partNumberModal.querySelector('.cancel-btn');
        // 遷移画面登録モーダル
        this.transitionScreenModal = document.getElementById('transition-screen-modal');
        this.transitionScreenModalCancelBtn = this.transitionScreenModal.querySelector('.cancel-btn');

        this.modals = document.querySelectorAll('.modal');
        this.rect = null; // 選択されている矩形の相対座標

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('input[name="selection-type"]').forEach(input => {
            input.addEventListener('change', () => {
                if (document.querySelector('input[name="selection-type"]:checked')) {
                    this.actionSelectionNextBtn.disabled = false; // 選択されたら「次へ」ボタンを有効化
                }
            });
        });
        this.actionSelectionCancelBtn.addEventListener('click', () => this.closeModal(this.actionSelectionModal));
        this.actionSelectionNextBtn.addEventListener('click', () => this.handleNext());

        this.partNumberModalCancelBtn.addEventListener('click', () => this.closeModal(this.partNumberModal));
        this.transitionScreenModalCancelBtn.addEventListener('click', () => this.closeModal(this.transitionScreenModal));
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

    openActionStartModal(rect) {
        this.rect = rect;
        this.openModal(this.actionSelectionModal)
    }

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
        console.log('Opening Part Number Registration Modal');
        this.openModal(this.partNumberModal)
    }

    openTransitionScreenModal() {
        console.log('Opening Transition Screen Registration Modal');
        this.openModal(this.transitionScreenModal)
    }
}
