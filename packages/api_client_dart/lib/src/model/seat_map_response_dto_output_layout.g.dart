// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_map_response_dto_output_layout.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SeatMapResponseDtoOutputLayout extends SeatMapResponseDtoOutputLayout {
  @override
  final BuiltList<SeatMapResponseDtoOutputLayoutDecksInner> decks;

  factory _$SeatMapResponseDtoOutputLayout(
          [void Function(SeatMapResponseDtoOutputLayoutBuilder)? updates]) =>
      (SeatMapResponseDtoOutputLayoutBuilder()..update(updates))._build();

  _$SeatMapResponseDtoOutputLayout._({required this.decks}) : super._();
  @override
  SeatMapResponseDtoOutputLayout rebuild(
          void Function(SeatMapResponseDtoOutputLayoutBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SeatMapResponseDtoOutputLayoutBuilder toBuilder() =>
      SeatMapResponseDtoOutputLayoutBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SeatMapResponseDtoOutputLayout && decks == other.decks;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, decks.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SeatMapResponseDtoOutputLayout')
          ..add('decks', decks))
        .toString();
  }
}

class SeatMapResponseDtoOutputLayoutBuilder
    implements
        Builder<SeatMapResponseDtoOutputLayout,
            SeatMapResponseDtoOutputLayoutBuilder> {
  _$SeatMapResponseDtoOutputLayout? _$v;

  ListBuilder<SeatMapResponseDtoOutputLayoutDecksInner>? _decks;
  ListBuilder<SeatMapResponseDtoOutputLayoutDecksInner> get decks =>
      _$this._decks ??= ListBuilder<SeatMapResponseDtoOutputLayoutDecksInner>();
  set decks(ListBuilder<SeatMapResponseDtoOutputLayoutDecksInner>? decks) =>
      _$this._decks = decks;

  SeatMapResponseDtoOutputLayoutBuilder() {
    SeatMapResponseDtoOutputLayout._defaults(this);
  }

  SeatMapResponseDtoOutputLayoutBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _decks = $v.decks.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SeatMapResponseDtoOutputLayout other) {
    _$v = other as _$SeatMapResponseDtoOutputLayout;
  }

  @override
  void update(void Function(SeatMapResponseDtoOutputLayoutBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SeatMapResponseDtoOutputLayout build() => _build();

  _$SeatMapResponseDtoOutputLayout _build() {
    _$SeatMapResponseDtoOutputLayout _$result;
    try {
      _$result = _$v ??
          _$SeatMapResponseDtoOutputLayout._(
            decks: decks.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'decks';
        decks.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SeatMapResponseDtoOutputLayout', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
